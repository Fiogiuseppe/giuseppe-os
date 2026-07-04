import type { DecisionCategory } from '../../engine/decisionEngine';

export type DecisionStatus =
  | 'created'
  | 'recommended'
  | 'taken'
  | 'awaiting_review'
  | 'reviewed'
  | 'closed';

export type TrajectoryEffect = 'strengthens' | 'weakens' | 'neutral' | 'unknown';

export type DecisionMemoryRecord = {
  id: string;
  decision: string;
  reason: string;
  category?: DecisionCategory | string;
  timestamp: string;
  status: DecisionStatus;
  recommendation?: string;
  nextAction?: string;
  reviewAfter?: string;
  reviewCompletedAt?: string;
  takenAt?: string;
  outcome?: string;
  outcomeRating?: number | null;
  lesson?: string;
  trajectoryEffect?: TrajectoryEffect;
  confidenceBefore?: number | null;
  confidenceAfter?: number | null;
};

export type ReviewDelayDays = 7 | 30 | 90 | 365;

export type ReviewScheduleConfig = Partial<Record<DecisionCategory | 'default', ReviewDelayDays>>;

export type DecisionReviewAnswers = {
  didIt: 'yes' | 'partial' | 'no';
  satisfaction: number;
  sameDecision: 'yes' | 'no' | 'unsure';
  lesson?: string;
};

export type DueDecisionReview = DecisionMemoryRecord & {
  daysWaiting: number;
};
