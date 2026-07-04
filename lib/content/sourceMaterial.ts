import { loadBrain } from '../memory/persistentStore';
import { loadLongTermMemory } from '../brain/memory/store';
import { getReviewedDecisions } from '../decision-learning/learning';
import type { DecisionMemoryRecord } from '../decision-learning/types';
import type { GatherSourceMaterialInput, SourceMaterial } from './types';

function activeProjectsSummary(projects: Record<string, { role: string; status: string }>): string {
  return Object.entries(projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .map(([name, project]) => `${name}: ${project.role} (${project.status})`)
    .join('\n');
}

export async function gatherSourceMaterial(input: GatherSourceMaterialInput): Promise<SourceMaterial> {
  const [brain, longTerm] = await Promise.all([loadBrain(), loadLongTermMemory()]);

  if (input.sourceType === 'decision') {
    const reviewed = getReviewedDecisions(longTerm.decisions) as DecisionMemoryRecord[];
    const pool = (reviewed.length > 0 ? reviewed : longTerm.decisions) as DecisionMemoryRecord[];
    const decision =
      (input.sourceId ? pool.find(row => row.id === input.sourceId) : null) ??
      reviewed.find(row => row.outcome) ??
      pool.at(-1);

    if (!decision) {
      throw new Error('No decision found for content generation.');
    }

    const lines = [
      `Decision: ${decision.decision}`,
      decision.reason ? `Reason: ${decision.reason}` : null,
      decision.category ? `Category: ${decision.category}` : null,
      decision.recommendation ? `Recommendation: ${decision.recommendation}` : null,
      decision.nextAction ? `Next action: ${decision.nextAction}` : null,
      decision.outcome ? `Outcome: ${decision.outcome}` : null,
      decision.outcomeRating != null ? `Outcome rating: ${decision.outcomeRating}/5` : null,
      decision.lesson ? `Lesson: ${decision.lesson}` : null,
      decision.trajectoryEffect ? `Trajectory effect: ${decision.trajectoryEffect}` : null,
      decision.status ? `Status: ${decision.status}` : null
    ].filter((line): line is string => Boolean(line));

    return {
      sourceType: 'decision',
      title: decision.decision,
      summary: decision.outcome ?? decision.reason ?? decision.decision,
      body: lines.join('\n'),
      metadata: {
        id: decision.id,
        hasOutcome: decision.outcome ? 1 : 0,
        outcomeRating: decision.outcomeRating ?? null
      }
    };
  }

  if (input.sourceType === 'insight') {
    const history = longTerm.insight_history ?? [];
    const match =
      (input.sourceId ? history.find(row => row.id === input.sourceId || row.insightId === input.sourceId) : null) ??
      (input.topic ? history.find(row => row.insight.includes(input.topic!)) : null);

    if (match) {
      return {
        sourceType: 'insight',
        title: 'Insight observation',
        summary: match.insight,
        body: [
          `Insight: ${match.insight}`,
          `Signal type: ${match.signalType}`,
          `Evidence score: ${match.evidenceScore}`,
          `Observed at: ${match.timestamp}`
        ].join('\n'),
        metadata: { id: match.id, evidenceScore: match.evidenceScore }
      };
    }

    if (input.topic?.trim()) {
      return {
        sourceType: 'insight',
        title: 'Current insight',
        summary: input.topic.trim(),
        body: [
          `Insight: ${input.topic.trim()}`,
          `Constitution WHY: ${brain.constitution.why}`,
          `Active projects:\n${activeProjectsSummary(brain.projects)}`
        ].join('\n'),
        metadata: { id: 'live-insight', evidenceScore: null }
      };
    }

    throw new Error('No insight found for content generation.');
  }

  if (input.sourceType === 'pattern') {
    const patterns = [...longTerm.patterns_detected, ...brain.patterns];
    const unique = Array.from(new Set(patterns));
    const index = input.sourceId ? Number.parseInt(input.sourceId, 10) : 0;
    const pattern = unique[Number.isFinite(index) ? index : 0] ?? input.topic?.trim();

    if (!pattern) {
      throw new Error('No pattern found for content generation.');
    }

    return {
      sourceType: 'pattern',
      title: 'Observed pattern',
      summary: pattern,
      body: [`Pattern: ${pattern}`, `Constitution HOW:\n${brain.constitution.how.map(line => `- ${line}`).join('\n')}`].join(
        '\n'
      ),
      metadata: { index: Number.isFinite(index) ? index : 0 }
    };
  }

  const topic = input.topic?.trim();
  if (!topic) {
    throw new Error('Topic is required for freeform content generation.');
  }

  return {
    sourceType: 'freeform',
    title: topic,
    summary: topic,
    body: [
      `Topic: ${topic}`,
      `Constitution WHY: ${brain.constitution.why}`,
      `Constitution HOW:\n${brain.constitution.how.map(line => `- ${line}`).join('\n')}`,
      `North star: ${brain.north_star}`,
      `Active projects:\n${activeProjectsSummary(brain.projects)}`,
      `Values: ${brain.values.join(', ')}`
    ].join('\n'),
    metadata: { topic }
  };
}
