import type { AwarenessInsight, DecisionRecord } from '../../engine/awarenessEngine';
import type { LongTermMemory, WorkingMemory } from '../brain/types';
import { saveLongTermMemory, loadLongTermMemory } from '../memory/persistentStore';

export async function recordInsightObservation(
  insight: AwarenessInsight,
  evidenceScore: number
): Promise<void> {
  const longTerm = await loadLongTermMemory();
  const history = longTerm.insight_history ?? [];

  const entry = {
    id: `insight_${Date.now()}`,
    insightId: insight.signalType,
    insight: insight.insight,
    signalType: insight.signalType,
    evidenceScore,
    timestamp: new Date().toISOString()
  };

  const nextPatterns = longTerm.patterns_detected.includes(insight.insight)
    ? longTerm.patterns_detected
    : [...longTerm.patterns_detected, insight.insight].slice(-20);

  await saveLongTermMemory({
    ...longTerm,
    patterns_detected: nextPatterns,
    insight_history: [...history, entry].slice(-40)
  });
}

export function buildDecisionHistory(longTerm: LongTermMemory): DecisionRecord[] {
  return longTerm.decisions.map(row => ({
    decision: row.decision,
    reason: row.reason,
    category: row.category
  }));
}

export function buildEvidenceSnapshot(longTerm: LongTermMemory, working: WorkingMemory) {
  return {
    decisionCount: longTerm.decisions.length,
    lessonCount: longTerm.lessons.length,
    sessionCount: working.sessions.length,
    patternCount: longTerm.patterns_detected.length,
    insightHistoryCount: longTerm.insight_history?.length ?? 0
  };
}
