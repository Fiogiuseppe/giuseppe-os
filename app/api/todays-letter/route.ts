import { MAX_BRIEFING_WORDS } from '../../../lib/todays-letter/prompt';
import { generateDailyBriefing, mapBriefingError } from '../../../lib/todays-letter/generate';
import { isAILiveMode, resolveAIMode, resolveConfiguredAiProvider } from '../../../lib/ai/mode';

function parseLocale(body: Record<string, unknown> | null): 'it' | 'en' {
  return body?.locale === 'en' ? 'en' : 'it';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const regenerate = body.regenerate === true;

    if (regenerate && !isAILiveMode()) {
      return Response.json(
        { error: 'Regenerate is available only when live AI is enabled on the server.' },
        { status: 403 }
      );
    }

    const response = await generateDailyBriefing(parseLocale(body), {
      regenerate
    });
    return Response.json(response);
  } catch (error) {
    const mapped = mapBriefingError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-personal-intelligence-os',
    version: '1.7.0-daily-briefing',
    method: 'POST',
    maxWords: MAX_BRIEFING_WORDS,
    aiMode: resolveAIMode(),
    provider: resolveConfiguredAiProvider(),
    cache: 'daily',
    cacheLayers: ['file', 'platform-data-cache'],
    pipeline: [
      'reality-engine',
      'personal-relevance-engine',
      'trajectory-engine',
      'daily-briefing-generator',
      'quality-engine'
    ]
  });
}
