export interface OracleEvidenceCategoryMeta {
  insufficientData: boolean;
  recordCount: number;
}

export interface OracleDecisionRecord {
  id: string;
  decision: string;
  reason: string;
  category?: string;
  timestamp: string;
  outcome?: string;
  outcomeRating?: number | null;
  reviewed: boolean;
  weakensTrajectory: boolean;
  strengthensTrajectory: boolean;
}

export interface OracleOutcomeRecord {
  decisionId: string;
  decision: string;
  outcome: string;
  rating?: number | null;
  timestamp: string;
}

export interface OracleFrequencyCount {
  id: string;
  label: string;
  countA: number;
  countB: number;
  total: number;
  description: string;
}

export interface OracleStreak {
  id: string;
  behavior: string;
  consecutiveDays: number;
  daysSinceLast: number | null;
  lastOccurredAt: string | null;
  insufficientData: boolean;
}

export interface OracleEvidence {
  topic?: string;
  gatheredAt: string;
  backend: 'supabase' | 'memory';
  decisions: {
    meta: OracleEvidenceCategoryMeta;
    records: OracleDecisionRecord[];
  };
  outcomes: {
    meta: OracleEvidenceCategoryMeta;
    records: OracleOutcomeRecord[];
  };
  frequencies: {
    meta: OracleEvidenceCategoryMeta;
    counts: OracleFrequencyCount[];
  };
  streaks: {
    meta: OracleEvidenceCategoryMeta;
    items: OracleStreak[];
  };
  patterns: {
    meta: OracleEvidenceCategoryMeta;
    detected: string[];
  };
}

export interface OracleValidationReport {
  passed: boolean;
  warnings: string[];
}
