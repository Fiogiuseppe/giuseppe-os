import { loadLongTermMemory, saveLongTermMemory } from '../../../../lib/brain/memory/store';

function testRoutesEnabled(): boolean {
  return (
    process.env.ALLOW_TEST_ROUTES === '1' ||
    process.env.NODE_ENV === 'development' ||
    process.env.AI_MODE === 'mock'
  );
}

export async function POST() {
  if (!testRoutesEnabled()) {
    return Response.json({ error: 'Test routes disabled.' }, { status: 403 });
  }

  const pastIso = new Date(Date.now() - 45 * 86_400_000).toISOString();
  const reviewedIso = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const longTerm = await loadLongTermMemory();

  const seeded = {
    id: 'decision_test_content',
    decision: 'Publish on LinkedIn weekly',
    reason: 'Build professional reputation without performing',
    category: 'reputation',
    timestamp: pastIso,
    status: 'reviewed' as const,
    reviewAfter: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    reviewCompletedAt: reviewedIso,
    takenAt: pastIso,
    recommendation: 'Publish one honest post per week',
    nextAction: 'Draft a short post about a real week at LEGO',
    outcome: 'Done. Would make the same choice.',
    outcomeRating: 5,
    lesson: 'Consistency beats intensity when the goal is trust, not reach.',
    trajectoryEffect: 'strengthens' as const,
    confidenceBefore: 0.72,
    confidenceAfter: 0.84
  };

  await saveLongTermMemory({
    ...longTerm,
    decisions: [...longTerm.decisions.filter(row => row.id !== seeded.id), seeded]
  });

  return Response.json({ ok: true, decisionId: seeded.id });
}
