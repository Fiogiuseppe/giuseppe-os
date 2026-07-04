import { isAILiveMode } from '../../../lib/ai/mode';
import { generateOnlineInsight } from '../../../lib/ai/insight-engine';

function parseLocale(body: Record<string, unknown> | null): 'it' | 'en' {
  return body?.locale === 'en' ? 'en' : 'it';
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-insights',
    engine: 'online-insight',
    liveEnabled: isAILiveMode()
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const regenerate = body.regenerate === true;

    if (regenerate && !isAILiveMode()) {
      return Response.json(
        { error: 'Live AI is disabled. Insight uses local intelligence only.' },
        { status: 403 }
      );
    }

    const response = await generateOnlineInsight(parseLocale(body), { regenerate });

    return Response.json({
      insight: response.insight,
      card: response.card,
      monthKey: response.monthKey,
      source: response.source === 'ai' ? 'live' : 'local',
      cached: response.cached,
      provider: response.provider
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Insight generation failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
