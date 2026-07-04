import type { BriefingFeedbackEntry } from '../learning/briefingFeedback';
import type { DecisionMemoryRecord, DecisionReviewAnswers } from '../decision-learning/types';
import { refreshDimensionEstimates } from './estimate';
import {
  dimensionsForBriefingSection,
  dimensionsForDecisionCategory,
  dimensionsForExecutionSignals,
  dimensionsForProjectActivity
} from './mapping';
import { loadSelfModel, saveSelfModel } from './store';
import type {
  DailyBriefFeedbackInput,
  DecisionOutcomeInput,
  ProjectActivityInput,
  SelfModel,
  SelfModelDimensionKey,
  SelfModelPattern
} from './types';

function isReviewAnswers(outcome: DecisionOutcomeInput): outcome is DecisionReviewAnswers {
  return typeof outcome === 'object' && outcome !== null && 'didIt' in outcome;
}

function appendEvidence(
  model: SelfModel,
  dimensionKey: SelfModelDimensionKey,
  source: string,
  notes: string[],
  now: string
): void {
  const current = model.dimensions[dimensionKey];
  const alreadyRecorded = current.evidence_sources.includes(source);

  const evidence_sources = alreadyRecorded
    ? current.evidence_sources
    : [...current.evidence_sources, source].slice(-30);

  const mergedNotes = [...current.notes];
  for (const note of notes) {
    if (!mergedNotes.includes(note)) {
      mergedNotes.push(note);
    }
  }

  model.dimensions[dimensionKey] = refreshDimensionEstimates({
    ...current,
    evidence_count: alreadyRecorded ? current.evidence_count : current.evidence_count + 1,
    last_updated: now,
    evidence_sources,
    notes: mergedNotes.slice(-20)
  });
}

function upsertPattern(
  model: SelfModel,
  pattern: string,
  dimensions: SelfModelDimensionKey[],
  source: string,
  now: string
): void {
  const existing = model.patterns.find(row => row.pattern === pattern);
  if (existing) {
    existing.evidence_count += 1;
    existing.last_updated = now;
    existing.confidence = existing.evidence_count >= 3 ? 'medium' : 'low';
    return;
  }

  const entry: SelfModelPattern = {
    id: `pattern_${Date.now()}`,
    pattern,
    dimensions,
    evidence_count: 1,
    confidence: 'low',
    last_updated: now,
    source
  };

  model.patterns = [...model.patterns, entry].slice(-20);
}

function executionNote(decision: DecisionMemoryRecord, answers: DecisionReviewAnswers): string | null {
  if (answers.didIt === 'yes') {
    return `Decision followed through: "${decision.decision}"`;
  }

  if (answers.didIt === 'no') {
    return `Intent without execution: "${decision.decision}"`;
  }

  if (answers.didIt === 'partial') {
    return `Partial execution on decision: "${decision.decision}"`;
  }

  return null;
}

function outcomeNote(decision: DecisionMemoryRecord, answers?: DecisionReviewAnswers): string | null {
  if (decision.outcome?.trim()) {
    return `Reviewed outcome for "${decision.decision}": ${decision.outcome}`;
  }

  if (!answers) {
    return null;
  }

  if (answers.satisfaction >= 4) {
    return `Positive reviewed outcome for "${decision.decision}"`;
  }

  if (answers.satisfaction <= 2) {
    return `Weak outcome on "${decision.decision}" — needs attention`;
  }

  return `Reviewed outcome for "${decision.decision}"`;
}

function lessonNote(decision: DecisionMemoryRecord): string | null {
  return decision.lesson?.trim() ? `Lesson from "${decision.decision}": ${decision.lesson}` : null;
}

async function mutateSelfModel(mutator: (model: SelfModel, now: string) => void): Promise<SelfModel> {
  const model = await loadSelfModel();
  const now = new Date().toISOString();
  mutator(model, now);
  model.updatedAt = now;
  await saveSelfModel(model);
  return model;
}

export async function updateSelfModelFromDecision(
  decision: DecisionMemoryRecord,
  outcome: DecisionOutcomeInput
): Promise<SelfModel> {
  const answers = isReviewAnswers(outcome) ? outcome : undefined;
  const categoryDimensions = dimensionsForDecisionCategory(decision.category);
  const executionDimensions = dimensionsForExecutionSignals();
  const targetDimensions = Array.from(new Set([...categoryDimensions, ...executionDimensions]));

  return mutateSelfModel((model, now) => {
    const source = `decision:${decision.id}`;
    const notes = [
      outcomeNote(decision, answers),
      answers ? executionNote(decision, answers) : null,
      lessonNote(decision)
    ].filter((note): note is string => Boolean(note));

    for (const dimensionKey of targetDimensions) {
      appendEvidence(model, dimensionKey, source, notes, now);
    }

    if (decision.lesson?.trim()) {
      upsertPattern(model, decision.lesson.trim(), categoryDimensions, source, now);
    }

    if (answers?.didIt === 'no' && answers.sameDecision === 'yes') {
      upsertPattern(
        model,
        'Intent without execution on similar decisions',
        dimensionsForExecutionSignals(),
        source,
        now
      );
    }
  });
}

export async function updateSelfModelFromDailyBriefFeedback(
  feedback: DailyBriefFeedbackInput | BriefingFeedbackEntry
): Promise<SelfModel> {
  return mutateSelfModel((model, now) => {
    const source = `briefing:${feedback.id}`;
    const dimensions = dimensionsForBriefingSection(feedback.section);
    const ratingNote =
      feedback.rating === 'helpful'
        ? `Daily brief section ${feedback.section ?? 'general'} felt helpful`
        : feedback.rating === 'not_helpful'
          ? `Daily brief section ${feedback.section ?? 'general'} felt not helpful`
          : `Daily brief section ${feedback.section ?? 'general'} felt neutral`;

    const notes = [ratingNote, feedback.note?.trim()].filter((note): note is string => Boolean(note));

    for (const dimensionKey of dimensions) {
      appendEvidence(model, dimensionKey, source, notes, now);
    }
  });
}

export async function updateSelfModelFromProjectActivity(activity: ProjectActivityInput): Promise<SelfModel> {
  return mutateSelfModel((model, now) => {
    const source = `project:${activity.projectName}`;
    const dimensions = dimensionsForProjectActivity(activity.status);
    const notes = [
      `Project activity: ${activity.projectName} (${activity.status})`,
      activity.role ? `Role: ${activity.role}` : null,
      activity.note?.trim() ?? null
    ].filter((note): note is string => Boolean(note));

    for (const dimensionKey of dimensions) {
      appendEvidence(model, dimensionKey, source, notes, now);
    }
  });
}
