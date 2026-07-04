import { findNextDueReview } from '../../../../../lib/decision-learning/followUp';
import { loadLongTermMemory } from '../../../../../lib/brain/memory/store';

export async function GET() {
  const longTerm = await loadLongTermMemory();
  const due = findNextDueReview(longTerm.decisions);

  if (!due) {
    return Response.json({ due: null });
  }

  return Response.json({
    due: {
      id: due.id,
      decision: due.decision,
      category: due.category,
      recommendation: due.recommendation,
      nextAction: due.nextAction,
      daysWaiting: due.daysWaiting,
      reviewAfter: due.reviewAfter,
      takenAt: due.takenAt
    }
  });
}
