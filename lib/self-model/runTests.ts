import { resetInMemoryStoreForTests } from '../memory/inMemoryStore';
import { SUFFICIENT_EVIDENCE_COUNT } from './constants';
import { resetSelfModelForTests } from './inMemoryStore';
import { getLowConfidenceAreas, getSelfModelSummary, getStrongestPatterns } from './summary';
import { loadSelfModel } from './store';
import {
  updateSelfModelFromDailyBriefFeedback,
  updateSelfModelFromDecision,
  updateSelfModelFromProjectActivity
} from './update';
import type { DecisionMemoryRecord } from '../decision-learning/types';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(): Promise<void> {
  resetInMemoryStoreForTests();
  resetSelfModelForTests();

  const empty = await loadSelfModel();
  assert(getLowConfidenceAreas(empty).length === 15, 'empty model should mark all dimensions low-confidence');

  const decision: DecisionMemoryRecord = {
    id: 'decision_self_model_test',
    decision: 'Publish on LinkedIn weekly',
    reason: 'Build reputation without performing',
    category: 'reputation',
    timestamp: new Date().toISOString(),
    status: 'reviewed',
    outcome: 'Done. Would make the same choice.',
    outcomeRating: 5,
    lesson: 'Consistency beats intensity when the goal is trust, not reach.'
  };

  await updateSelfModelFromDecision(decision, {
    didIt: 'yes',
    satisfaction: 5,
    sameDecision: 'yes',
    lesson: decision.lesson
  });

  let model = await loadSelfModel();
  assert(
    model.dimensions.reputation.evidence_count > 0,
    'reputation dimension should receive decision evidence'
  );
  assert(
    model.dimensions.reputation.current_estimate === 'unknown',
    'estimate should stay unknown before sufficient evidence'
  );

  for (let index = 0; index < SUFFICIENT_EVIDENCE_COUNT; index += 1) {
    await updateSelfModelFromDecision(
      { ...decision, id: `decision_self_model_test_${index}` },
      {
        didIt: 'yes',
        satisfaction: 5,
        sameDecision: 'yes'
      }
    );
  }

  model = await loadSelfModel();
  assert(
    model.dimensions.reputation.evidence_count >= SUFFICIENT_EVIDENCE_COUNT,
    'reputation should reach sufficient evidence'
  );
  assert(
    model.dimensions.reputation.current_estimate !== 'unknown',
    'reputation estimate should emerge only with sufficient evidence'
  );

  await updateSelfModelFromDailyBriefFeedback({
    id: 'brief_feedback_1',
    dateKey: '2026-07-04',
    rating: 'helpful',
    section: 'oneBigMove',
    createdAt: new Date().toISOString()
  });

  model = await loadSelfModel();
  assert(model.dimensions.execution.evidence_count > 0, 'brief feedback should touch execution');

  await updateSelfModelFromProjectActivity({
    projectName: 'Urees',
    status: 'active',
    role: 'Artist-led publishing'
  });

  model = await loadSelfModel();
  assert(model.dimensions.creative_energy.evidence_count > 0, 'project activity should touch creative energy');

  const summary = getSelfModelSummary(model);
  assert(summary.text.includes('SELF MODEL'), 'summary should include self model header');
  assert(!/:\s*unknown\b/i.test(summary.text), 'summary should not surface unknown estimates as truth');

  const patterns = getStrongestPatterns(model);
  assert(patterns.length > 0, 'lesson-derived patterns should be stored');

  console.log('self-model tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
