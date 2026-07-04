import type { DecisionCategory } from '../../engine/decisionEngine';
import type { ReviewDelayDays, ReviewScheduleConfig } from './types';

export const DEFAULT_REVIEW_SCHEDULE: ReviewScheduleConfig = {
  reputation: 7,
  emotional_purchase: 7,
  finance: 30,
  real_estate: 30,
  career: 30,
  creative_project: 30,
  life_decision: 90,
  default: 30
};

export function getReviewDelayDays(
  category?: string,
  config: ReviewScheduleConfig = DEFAULT_REVIEW_SCHEDULE
): ReviewDelayDays {
  const key = (category ?? 'default') as DecisionCategory | 'default';
  return (config[key] ?? config.default ?? 30) as ReviewDelayDays;
}

export function computeReviewAfter(
  createdAt: string | Date,
  category?: string,
  config: ReviewScheduleConfig = DEFAULT_REVIEW_SCHEDULE
): string {
  const base = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const delayDays = getReviewDelayDays(category, config);
  const reviewDate = new Date(base);
  reviewDate.setUTCDate(reviewDate.getUTCDate() + delayDays);
  return reviewDate.toISOString();
}

export function daysBetween(startIso: string, end = new Date()): number {
  const start = new Date(startIso).getTime();
  const finish = end.getTime();
  return Math.max(0, Math.floor((finish - start) / (1000 * 60 * 60 * 24)));
}
