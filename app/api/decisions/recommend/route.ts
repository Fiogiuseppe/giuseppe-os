import { generateDecisionAI } from '../../../../lib/ai/decision-ai';
import { evaluateMissionAlignment } from '../../../../lib/brain/missionGate';
import { recordDecisionRecommendation } from '../../../../lib/decision-learning/learning';
import { resolveLocale } from '../../../../lib/i18n/locale';

function parseAnswers(body: Record<string, unknown>): Record<string, string> {
  const raw = body.answers;
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'decision-ai',
    fields: [
      'recommendation',
      'risks',
      'emotionalBiasCheck',
      'alignment',
      'nextAction',
      'missingInformation'
    ]
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const decision = typeof body.decision === 'string' ? body.decision.trim() : '';

    if (!decision) {
      return Response.json({ error: 'Decision text is required.' }, { status: 400 });
    }

    const locale = resolveLocale(body.locale === 'en' ? 'en' : 'it');
    const answers = parseAnswers(body);
    const persist = body.persist !== false;

    const { decision: result, provider } = await generateDecisionAI({
      decision,
      answers,
      locale
    });

    const missionAligned = evaluateMissionAlignment(
      {
        intent: 'decide',
        decision,
        reason: Object.values(answers).join(' '),
        message: decision
      },
      result.recommendation
    );

    if (persist) {
      await recordDecisionRecommendation({
        decision,
        reason: Object.entries(answers)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
        result,
        confidenceBefore: result.confidenceScore ?? 55
      });
    }

    return Response.json({
      decision: { ...result, provider },
      missionAligned,
      provider
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Decision AI failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
