import type { OracleEvidence } from './types';

export function formatEvidenceForPrompt(evidence: OracleEvidence): string {
  const lines: string[] = [
    'EVIDENCE (structured — quote only from this block; never invent beyond it):',
    `gatheredAt: ${evidence.gatheredAt}`,
    `backend: ${evidence.backend}`,
    evidence.topic ? `topicFilter: ${evidence.topic}` : 'topicFilter: none',
    '',
    'DECISIONS:',
    `insufficientData: ${evidence.decisions.meta.insufficientData}`,
    `recordCount: ${evidence.decisions.meta.recordCount}`
  ];

  for (const row of evidence.decisions.records) {
    lines.push(
      `- id=${row.id} | at=${row.timestamp} | category=${row.category ?? 'uncategorized'} | decision="${row.decision}" | reason="${row.reason}" | weakensTrajectory=${row.weakensTrajectory} | strengthensTrajectory=${row.strengthensTrajectory}`
    );
  }

  lines.push(
    '',
    'OUTCOMES:',
    `insufficientData: ${evidence.outcomes.meta.insufficientData}`,
    `recordCount: ${evidence.outcomes.meta.recordCount}`
  );

  for (const row of evidence.outcomes.records) {
    lines.push(
      `- decisionId=${row.decisionId} | at=${row.timestamp} | decision="${row.decision}" | outcome="${row.outcome}" | rating=${row.rating ?? 'null'}`
    );
  }

  lines.push(
    '',
    'FREQUENCIES:',
    `insufficientData: ${evidence.frequencies.meta.insufficientData}`,
    `recordCount: ${evidence.frequencies.meta.recordCount}`
  );

  for (const row of evidence.frequencies.counts) {
    lines.push(`- ${row.id}: ${row.description}`);
  }

  lines.push(
    '',
    'STREAKS:',
    `insufficientData: ${evidence.streaks.meta.insufficientData}`,
    `recordCount: ${evidence.streaks.meta.recordCount}`
  );

  for (const row of evidence.streaks.items) {
    lines.push(
      `- ${row.id}: behavior=${row.behavior} | consecutiveDays=${row.consecutiveDays} | daysSinceLast=${row.daysSinceLast ?? 'null'} | lastOccurredAt=${row.lastOccurredAt ?? 'null'} | insufficientData=${row.insufficientData}`
    );
  }

  lines.push(
    '',
    'PATTERNS_DETECTED:',
    `insufficientData: ${evidence.patterns.meta.insufficientData}`,
    `recordCount: ${evidence.patterns.meta.recordCount}`
  );

  for (const pattern of evidence.patterns.detected) {
    lines.push(`- pattern="${pattern}"`);
  }

  return lines.join('\n');
}
