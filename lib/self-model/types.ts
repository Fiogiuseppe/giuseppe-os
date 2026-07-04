import type { BriefingFeedbackEntry } from '../learning/briefingFeedback';
import type { DecisionMemoryRecord, DecisionReviewAnswers } from '../decision-learning/types';

export const SELF_MODEL_DIMENSION_KEYS = [
  'creative_energy',
  'focus',
  'freedom',
  'financial_security',
  'health',
  'relationships',
  'courage',
  'consistency',
  'curiosity',
  'reputation',
  'learning',
  'emotional_clarity',
  'execution',
  'risk_tolerance',
  'alignment_with_future_self'
] as const;

export type SelfModelDimensionKey = (typeof SELF_MODEL_DIMENSION_KEYS)[number];

export type SelfModelConfidence = 'low' | 'medium' | 'high';

export type SelfModelDimension = {
  current_estimate: string;
  confidence: SelfModelConfidence;
  evidence_count: number;
  last_updated: string | null;
  evidence_sources: string[];
  notes: string[];
};

export type SelfModelPattern = {
  id: string;
  pattern: string;
  dimensions: SelfModelDimensionKey[];
  evidence_count: number;
  confidence: SelfModelConfidence;
  last_updated: string;
  source: string;
};

export type SelfModel = {
  id: string;
  version: string;
  updatedAt: string;
  dimensions: Record<SelfModelDimensionKey, SelfModelDimension>;
  patterns: SelfModelPattern[];
};

export type ProjectActivityInput = {
  projectName: string;
  status: string;
  role?: string;
  note?: string;
};

export type SelfModelSummary = {
  text: string;
  dimensionsWithEvidence: number;
  lowConfidenceCount: number;
  patternCount: number;
};

export type DecisionOutcomeInput = DecisionReviewAnswers | string;

export type DailyBriefFeedbackInput = BriefingFeedbackEntry;

export { type DecisionMemoryRecord, type DecisionReviewAnswers };
