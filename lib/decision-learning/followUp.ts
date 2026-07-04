import { daysBetween } from './schedule';
import type { DecisionMemoryRecord, DecisionStatus, DueDecisionReview } from './types';

type ReviewableDecision = Omit<DecisionMemoryRecord, 'status'> & { status?: DecisionStatus };

function isReviewCompleted(record: ReviewableDecision): boolean {
  return Boolean(record.reviewCompletedAt) || record.status === 'reviewed' || record.status === 'closed';
}

function isReviewDue(record: ReviewableDecision, now = new Date()): boolean {
  if (isReviewCompleted(record)) {
    return false;
  }

  if (record.status !== 'awaiting_review' && record.status !== 'taken') {
    return false;
  }

  if (!record.reviewAfter) {
    return false;
  }

  return new Date(record.reviewAfter).getTime() <= now.getTime();
}

export function findDueReviews(
  decisions: ReviewableDecision[],
  now = new Date()
): DueDecisionReview[] {
  return decisions
    .filter(record => isReviewDue(record, now))
    .map(record => ({
      ...record,
      status: record.status ?? 'awaiting_review',
      daysWaiting: daysBetween(record.reviewAfter ?? record.timestamp, now)
    }))
    .sort((a, b) => {
      const aTime = new Date(a.reviewAfter ?? a.timestamp).getTime();
      const bTime = new Date(b.reviewAfter ?? b.timestamp).getTime();
      return aTime - bTime;
    });
}

export function findNextDueReview(
  decisions: ReviewableDecision[],
  now = new Date()
): DueDecisionReview | null {
  const due = findDueReviews(decisions, now);
  return due[0] ?? null;
}

export function countPendingReviews(decisions: ReviewableDecision[], now = new Date()): number {
  return findDueReviews(decisions, now).length;
}
