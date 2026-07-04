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

  const pastIso = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const longTerm = await loadLongTermMemory();

  const seeded = {
    id: 'decision_test_review',
    decision: 'Pubblicare più su LinkedIn',
    reason: 'Costruire reputazione professionale',
    category: 'reputation',
    timestamp: pastIso,
    status: 'awaiting_review' as const,
    reviewAfter: new Date(Date.now() - 86_400_000).toISOString(),
    takenAt: pastIso,
    recommendation: 'Pubblica una volta a settimana',
    nextAction: 'Scrivi un post questa settimana',
    confidenceBefore: 0.7
  };

  await saveLongTermMemory({
    ...longTerm,
    decisions: [...longTerm.decisions.filter(row => row.id !== seeded.id), seeded]
  });

  return Response.json({ ok: true, decisionId: seeded.id });
}
