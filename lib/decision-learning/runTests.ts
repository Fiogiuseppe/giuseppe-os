import { resetInMemoryStoreForTests, saveLongTermMemoryToMemory } from '../memory/inMemoryStore';
import { applyDecisionReview, recordDecisionRecommendation } from './learning';
import { findDueReviews, findNextDueReview } from './followUp';
import { computeReviewAfter, getReviewDelayDays } from './schedule';
import { runDecisionEngine } from '../../engine/decisionEngine';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(): Promise<void> {
  resetInMemoryStoreForTests();

  const delay = getReviewDelayDays('reputation');
  assert(delay === 7, 'reputation review delay should be 7 days');

  const reviewAfter = computeReviewAfter('2026-01-01T00:00:00.000Z', 'career');
  assert(reviewAfter > '2026-01-01', 'review_after should be in the future');

  const engine = runDecisionEngine({
    decision: 'Pubblicare più su LinkedIn',
    reason: 'Voglio costruire reputazione professionale senza perdere focus creativo.',
    locale: 'it'
  });

  const recorded = await recordDecisionRecommendation({
    decision: 'Pubblicare più su LinkedIn',
    reason: engine.categoryLabel,
    result: {
      ...engine,
      recommendation: 'Test recommendation',
      whyItMatters: 'Test why',
      boardPerspective: 'Test board',
      confidenceScore: 62,
      confidenceLabel: 'score',
      source: 'engine'
    },
    confidenceBefore: 0.62
  });

  assert(recorded.status === 'awaiting_review', 'new decisions should await review');
  assert(Boolean(recorded.reviewAfter), 'review_after should be set');

  const pastReview = {
    ...recorded,
    id: 'decision_past',
    reviewAfter: new Date(Date.now() - 86_400_000).toISOString()
  };

  saveLongTermMemoryToMemory({
    decisions: [pastReview],
    lessons: [],
    patterns_detected: [],
    insight_history: []
  });

  const due = findDueReviews([pastReview]);
  assert(due.length === 1, 'past review_after should be due');

  const next = findNextDueReview([pastReview]);
  assert(next?.id === 'decision_past', 'next due review should match seeded decision');

  const reviewed = await applyDecisionReview({
    decisionId: 'decision_past',
    answers: {
      didIt: 'partial',
      satisfaction: 4,
      sameDecision: 'yes',
      lesson: 'Piccoli post costanti funzionano meglio di sprint rari.'
    },
    locale: 'it'
  });

  assert(reviewed?.status === 'reviewed', 'review should close decision');
  assert(Boolean(reviewed?.reviewCompletedAt), 'reviewCompletedAt should be set');
  assert(Boolean(reviewed?.outcome), 'outcome summary should be stored');
  assert(reviewed?.outcomeRating === 4, 'outcome rating should persist');

  const afterDue = findDueReviews([reviewed!]);
  assert(afterDue.length === 0, 'reviewed decisions should not be due again');

  console.log('decision-learning tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
