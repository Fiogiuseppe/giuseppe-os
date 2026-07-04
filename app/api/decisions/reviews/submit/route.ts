import { applyDecisionReview } from '../../../../../lib/decision-learning/learning';
import type { DecisionReviewAnswers } from '../../../../../lib/decision-learning/types';

function parseAnswers(body: Record<string, unknown>): DecisionReviewAnswers | null {
  const didIt = body.didIt;
  const satisfaction = body.satisfaction;
  const sameDecision = body.sameDecision;

  if (didIt !== 'yes' && didIt !== 'partial' && didIt !== 'no') {
    return null;
  }

  if (typeof satisfaction !== 'number' || satisfaction < 1 || satisfaction > 5) {
    return null;
  }

  if (sameDecision !== 'yes' && sameDecision !== 'no' && sameDecision !== 'unsure') {
    return null;
  }

  return {
    didIt,
    satisfaction: Math.round(satisfaction),
    sameDecision,
    lesson: typeof body.lesson === 'string' ? body.lesson : undefined
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const decisionId = typeof body.decisionId === 'string' ? body.decisionId : '';
    const locale = body.locale === 'en' ? 'en' : 'it';

    if (!decisionId) {
      return Response.json({ error: 'Missing decisionId.' }, { status: 400 });
    }

    const answers = parseAnswers(body);
    if (!answers) {
      return Response.json({ error: 'Invalid review answers.' }, { status: 400 });
    }

    const updated = await applyDecisionReview({ decisionId, answers, locale });
    if (!updated) {
      return Response.json({ error: 'Decision not found.' }, { status: 404 });
    }

    return Response.json({ ok: true, decision: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Review failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
