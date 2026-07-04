import { isAILiveMode } from '../../../lib/ai/mode';
import { getMonthlyInsight } from '../../../lib/insights/monthlyInsight';

function parseLocale(body: Record<string, unknown> | null): 'it' | 'en' {
  return body?.locale === 'en' ? 'en' : 'it';
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-insights',
    cache: 'monthly',
    liveEnabled: isAILiveMode()
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const regenerate = body.regenerate === true;

    if (regenerate && !isAILiveMode()) {
      return Response.json(
        { error: 'Live AI is disabled. Monthly insight uses local intelligence only.' },
        { status: 403 }
      );
    }

    const response = await getMonthlyInsight(parseLocale(body), { regenerate });
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Monthly insight failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
