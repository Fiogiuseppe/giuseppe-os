import { loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import type { LongTermMemory, WorkingMemorySession } from '../brain/types';
import { resolveMemoryBackend } from '../memory/persistentStore';
import type {
  OracleDecisionRecord,
  OracleEvidence,
  OracleEvidenceCategoryMeta,
  OracleFrequencyCount,
  OracleOutcomeRecord,
  OracleStreak
} from './types';
import { textStrengthensTrajectory, textWeakensTrajectory } from './trajectorySignals';

const MIN_RECORDS = 3;
const TIMEZONE = 'Europe/Copenhagen';

function categoryMeta(count: number): OracleEvidenceCategoryMeta {
  return {
    recordCount: count,
    insufficientData: count < MIN_RECORDS
  };
}

function toDateKey(iso: string, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIMEZONE
  }).format(new Date(iso));
}

function todayDateKey(now = new Date()): string {
  return toDateKey(now.toISOString(), now);
}

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function matchesTopic(text: string, topic?: string): boolean {
  if (!topic?.trim()) {
    return true;
  }
  return text.toLowerCase().includes(topic.trim().toLowerCase());
}

function filterDecisionsByTopic(
  decisions: LongTermMemory['decisions'],
  topic?: string
): LongTermMemory['decisions'] {
  if (!topic?.trim()) {
    return decisions;
  }
  return decisions.filter(
    row =>
      matchesTopic(row.decision, topic) ||
      matchesTopic(row.reason, topic) ||
      matchesTopic(row.category ?? '', topic)
  );
}

function mapDecisionRecords(decisions: LongTermMemory['decisions']): OracleDecisionRecord[] {
  return decisions.map(row => {
    const combined = `${row.decision} ${row.reason}`;
    return {
      id: row.id,
      decision: row.decision,
      reason: row.reason,
      category: row.category,
      timestamp: row.timestamp,
      outcome: row.outcome,
      outcomeRating: row.outcomeRating ?? null,
      reviewed: Boolean(row.reviewCompletedAt) || row.status === 'reviewed' || row.status === 'closed',
      weakensTrajectory: textWeakensTrajectory(combined),
      strengthensTrajectory: textStrengthensTrajectory(combined)
    };
  });
}

function mapOutcomeRecords(decisions: OracleDecisionRecord[]): OracleOutcomeRecord[] {
  return decisions
    .filter(row => Boolean(row.outcome?.trim()) && row.reviewed)
    .map(row => ({
      decisionId: row.id,
      decision: row.decision,
      outcome: row.outcome!.trim(),
      rating: row.outcomeRating ?? null,
      timestamp: row.timestamp
    }));
}

function buildFrequencyCounts(decisions: OracleDecisionRecord[]): OracleFrequencyCount[] {
  const strengthens = decisions.filter(row => row.strengthensTrajectory).length;
  const weakens = decisions.filter(row => row.weakensTrajectory).length;
  const neutral = decisions.length - strengthens - weakens;
  const total = decisions.length;

  if (total === 0) {
    return [];
  }

  const counts: OracleFrequencyCount[] = [
    {
      id: 'trajectory_strength_vs_weak',
      label: 'trajectory_alignment',
      countA: strengthens,
      countB: weakens,
      total,
      description: `${strengthens} out of ${total} recorded decisions align with strengthens-trajectory signals; ${weakens} align with weakens-trajectory signals; ${neutral} neutral.`
    }
  ];

  const byCategory = new Map<string, number>();
  for (const row of decisions) {
    const key = row.category?.trim() || 'uncategorized';
    byCategory.set(key, (byCategory.get(key) ?? 0) + 1);
  }

  const sortedCategories = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  for (const [category, count] of sortedCategories) {
    counts.push({
      id: `category_${category}`,
      label: category,
      countA: count,
      countB: total - count,
      total,
      description: `${count} out of ${total} recorded decisions are in category "${category}".`
    });
  }

  return counts;
}

function computeConsecutiveDayStreak(dayKeys: Set<string>, now = new Date()): number {
  let streak = 0;
  let cursor = todayDateKey(now);

  while (dayKeys.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}

function daysSinceLastMatch(
  timestamps: string[],
  predicate: (iso: string) => boolean,
  now = new Date()
): number | null {
  const matches = timestamps
    .filter(predicate)
    .map(iso => new Date(iso).getTime())
    .sort((a, b) => b - a);

  if (matches.length === 0) {
    return null;
  }

  const today = new Date(todayDateKey(now)).getTime();
  const last = matches[0];
  return Math.floor((today - last) / (1000 * 60 * 60 * 24));
}

function buildStreaks(
  decisions: OracleDecisionRecord[],
  sessions: WorkingMemorySession[],
  now = new Date()
): OracleStreak[] {
  const decideDays = new Set(
    sessions.filter(session => session.intent === 'decide').map(session => toDateKey(session.timestamp, now))
  );

  const weakensDays = new Set(
    decisions
      .filter(row => row.weakensTrajectory)
      .map(row => toDateKey(row.timestamp, now))
  );

  const decideStreak = computeConsecutiveDayStreak(decideDays, now);
  const lastWeakens = decisions
    .filter(row => row.weakensTrajectory)
    .map(row => row.timestamp)
    .sort((a, b) => b.localeCompare(a))[0];

  const daysSinceWeakens = daysSinceLastMatch(
    decisions.map(row => row.timestamp),
    () => true,
    now
  );

  return [
    {
      id: 'consecutive_decide_days',
      behavior: 'days_with_recorded_decision_session',
      consecutiveDays: decideStreak,
      daysSinceLast: decideStreak > 0 ? 0 : daysSinceLastMatch(sessions.map(s => s.timestamp), () => true, now),
      lastOccurredAt:
        sessions
          .filter(session => session.intent === 'decide')
          .map(session => session.timestamp)
          .sort((a, b) => b.localeCompare(a))[0] ?? null,
      insufficientData: sessions.filter(session => session.intent === 'decide').length < MIN_RECORDS
    },
    {
      id: 'days_since_weakens_decision',
      behavior: 'days_since_last_weakens_trajectory_decision',
      consecutiveDays: 0,
      daysSinceLast: lastWeakens
        ? daysSinceLastMatch(decisions.filter(d => d.weakensTrajectory).map(d => d.timestamp), () => true, now)
        : null,
      lastOccurredAt: lastWeakens ?? null,
      insufficientData: decisions.filter(row => row.weakensTrajectory).length < MIN_RECORDS
    },
    {
      id: 'weakens_decision_day_coverage',
      behavior: 'distinct_days_with_weakens_trajectory_decision',
      consecutiveDays: weakensDays.size,
      daysSinceLast: daysSinceWeakens,
      lastOccurredAt: lastWeakens ?? null,
      insufficientData: weakensDays.size < MIN_RECORDS
    }
  ];
}

export async function gatherOracleEvidence(topic?: string, now = new Date()): Promise<OracleEvidence> {
  const [longTerm, working] = await Promise.all([loadLongTermMemory(), loadWorkingMemory()]);
  const filteredDecisions = filterDecisionsByTopic(longTerm.decisions, topic);
  const decisionRecords = mapDecisionRecords(filteredDecisions);
  const outcomeRecords = mapOutcomeRecords(decisionRecords);
  const frequencies = buildFrequencyCounts(decisionRecords);
  const streaks = buildStreaks(decisionRecords, working.sessions, now);
  const patterns = longTerm.patterns_detected.filter(pattern =>
    topic?.trim() ? matchesTopic(pattern, topic) : true
  );

  return {
    topic: topic?.trim() || undefined,
    gatheredAt: now.toISOString(),
    backend: resolveMemoryBackend(),
    decisions: {
      meta: categoryMeta(decisionRecords.length),
      records: decisionRecords
    },
    outcomes: {
      meta: categoryMeta(outcomeRecords.length),
      records: outcomeRecords
    },
    frequencies: {
      meta: categoryMeta(frequencies.length > 0 ? decisionRecords.length : 0),
      counts: frequencies
    },
    streaks: {
      meta: categoryMeta(streaks.filter(item => !item.insufficientData).length),
      items: streaks
    },
    patterns: {
      meta: categoryMeta(patterns.length),
      detected: patterns
    }
  };
}
