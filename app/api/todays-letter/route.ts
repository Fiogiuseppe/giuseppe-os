import { MAX_BRIEFING_WORDS } from '../../../lib/todays-letter/prompt';
import { generateDailyBriefing, mapBriefingError } from '../../../lib/todays-letter/generate';
import { resolveAIMode } from '../../../lib/ai/mode';
import { runWithAIRequestContext } from '../../../lib/ai/requestContext';
import { resolveRequestAILive } from '../../../lib/ai/resolveRequestLive';

function parseLocale(body: Record<string, unknown> | null): 'it' | 'en' {
  return body?.locale === 'en' ? 'en' : 'it';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const aiLive = resolveRequestAILive(request, body);

    const response = await runWithAIRequestContext({ aiLive }, () =>
      generateDailyBriefing(parseLocale(body), {
        regenerate: body.regenerate === true
      })
    );

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
    provider: 'anthropic',
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
