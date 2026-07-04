import type { DecisionAIResult } from '../brain/decisions/types';
import { loadLongTermMemory, saveLongTermMemory } from '../brain/memory/store';
import { textStrengthensTrajectory, textWeakensTrajectory } from '../oracle/trajectorySignals';
import { computeReviewAfter } from './schedule';
import type { DecisionMemoryRecord, DecisionReviewAnswers, TrajectoryEffect, DecisionStatus } from './types';

function inferTrajectoryEffect(text: string, rating: number): TrajectoryEffect {
  if (textWeakensTrajectory(text)) {
    return 'weakens';
  }
  if (textStrengthensTrajectory(text)) {
    return 'strengthens';
  }
  if (rating >= 4) {
    return 'strengthens';
  }
  if (rating <= 2) {
    return 'weakens';
  }
  return 'neutral';
}

function buildOutcomeSummary(answers: DecisionReviewAnswers, locale: 'it' | 'en'): string {
  const didIt =
    answers.didIt === 'yes'
      ? locale === 'it'
        ? 'Fatto'
        : 'Done'
      : answers.didIt === 'partial'
        ? locale === 'it'
          ? 'Parzialmente'
          : 'Partially'
        : locale === 'it'
          ? 'Non fatto'
          : 'Not done';

  const same =
    answers.sameDecision === 'yes'
      ? locale === 'it'
        ? 'Ripeterei la stessa scelta'
        : 'Would make the same choice'
      : answers.sameDecision === 'no'
        ? locale === 'it'
          ? 'Non ripeterei la stessa scelta'
          : 'Would not make the same choice'
        : locale === 'it'
          ? 'Incerto'
          : 'Unsure';

  return `${didIt}. ${same}.`;
}

function deriveLesson(
  record: DecisionMemoryRecord,
  answers: DecisionReviewAnswers,
  locale: 'it' | 'en'
): string | undefined {
  if (answers.lesson?.trim()) {
    return answers.lesson.trim();
  }

  if (answers.satisfaction >= 4 && answers.sameDecision === 'yes') {
    return locale === 'it'
      ? `Confermato: "${record.decision}" ha funzionato.`
      : `Confirmed: "${record.decision}" worked.`;
  }

  if (answers.satisfaction <= 2 || answers.sameDecision === 'no') {
    return locale === 'it'
      ? `Ripensamento su "${record.decision}": valutare un approccio più piccolo la prossima volta.`
      : `Rethink on "${record.decision}": try a smaller move next time.`;
  }

  return undefined;
}

function derivePattern(
  record: DecisionMemoryRecord,
  answers: DecisionReviewAnswers,
  locale: 'it' | 'en'
): string | undefined {
  if (answers.didIt === 'no' && answers.sameDecision === 'yes') {
    return locale === 'it'
      ? 'Intenzione senza esecuzione su decisioni simili'
      : 'Intent without execution on similar decisions';
  }

  if (answers.satisfaction <= 2) {
    return locale === 'it'
      ? `Esito debole su decisioni in categoria ${record.category ?? 'generale'}`
      : `Weak outcome on ${record.category ?? 'general'} decisions`;
  }

  return undefined;
}

function confidenceAfterFromReview(
  before: number | null | undefined,
  rating: number
): number | null {
  if (before === null || before === undefined) {
    return null;
  }

  const base = Math.round(before * 100);
  const delta = rating >= 4 ? 6 : rating <= 2 ? -8 : 0;
  return Math.max(25, Math.min(95, base + delta)) / 100;
}

export async function recordDecisionRecommendation(params: {
  decision: string;
  reason: string;
  result: DecisionAIResult;
  confidenceBefore: number;
}): Promise<DecisionMemoryRecord> {
  const longTerm = await loadLongTermMemory();
  const timestamp = new Date().toISOString();
  const id = `decision_${Date.now()}`;

  const record: DecisionMemoryRecord = {
    id,
    decision: params.decision,
    reason: params.reason,
    category: params.result.category,
    timestamp,
    status: 'awaiting_review',
    recommendation: params.result.recommendation,
    nextAction: params.result.nextAction,
    takenAt: timestamp,
    reviewAfter: computeReviewAfter(timestamp, params.result.category),
    confidenceBefore: params.confidenceBefore,
    trajectoryEffect: inferTrajectoryEffect(
      `${params.decision} ${params.reason}`,
      params.result.confidenceScore ?? 3
    )
  };

  await saveLongTermMemory({
    ...longTerm,
    decisions: [...longTerm.decisions, record].slice(-50)
  });

  return record;
}

export async function applyDecisionReview(params: {
  decisionId: string;
  answers: DecisionReviewAnswers;
  locale?: 'it' | 'en';
}): Promise<DecisionMemoryRecord | null> {
  const locale = params.locale ?? 'it';
  const longTerm = await loadLongTermMemory();
  const index = longTerm.decisions.findIndex(row => row.id === params.decisionId);

  if (index < 0) {
    return null;
  }

  const current = longTerm.decisions[index] as DecisionMemoryRecord;
  const outcome = buildOutcomeSummary(params.answers, locale);
  const lesson = deriveLesson(current, params.answers, locale);
  const pattern = derivePattern(current, params.answers, locale);
  const reviewCompletedAt = new Date().toISOString();
  const trajectoryEffect = inferTrajectoryEffect(
    `${current.decision} ${outcome} ${lesson ?? ''}`,
    params.answers.satisfaction
  );

  const updated: DecisionMemoryRecord = {
    ...current,
    status: 'reviewed',
    outcome,
    outcomeRating: params.answers.satisfaction,
    lesson,
    trajectoryEffect,
    reviewCompletedAt,
    confidenceAfter: confidenceAfterFromReview(current.confidenceBefore, params.answers.satisfaction)
  };

  const nextDecisions = [...longTerm.decisions];
  nextDecisions[index] = updated;

  const nextLessons = lesson
    ? [
        ...longTerm.lessons,
        {
          id: `lesson_${Date.now()}`,
          lesson,
          source: `decision:${current.id}`,
          timestamp: reviewCompletedAt
        }
      ].slice(-50)
    : longTerm.lessons;

  const nextPatterns =
    pattern && !longTerm.patterns_detected.includes(pattern)
      ? [...longTerm.patterns_detected, pattern].slice(-20)
      : longTerm.patterns_detected;

  await saveLongTermMemory({
    ...longTerm,
    decisions: nextDecisions,
    lessons: nextLessons,
    patterns_detected: nextPatterns
  });

  return updated;
}

export function getReviewedDecisions(
  decisions: Array<{
    id: string;
    decision: string;
    reason: string;
    category?: string;
    timestamp: string;
    status?: DecisionStatus;
    reviewCompletedAt?: string;
    outcome?: string;
    outcomeRating?: number | null;
    lesson?: string;
    trajectoryEffect?: TrajectoryEffect;
    confidenceBefore?: number | null;
    confidenceAfter?: number | null;
  }>
): Array<(typeof decisions)[number]> {
  return decisions.filter(
    row => Boolean(row.reviewCompletedAt) || row.status === 'reviewed' || row.status === 'closed'
  );
}
