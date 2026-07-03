import { MAX_BRIEFING_WORDS } from '../../../lib/todays-letter/prompt';
import { generateDailyBriefing, mapBriefingError } from '../../../lib/todays-letter/generate';

export async function POST() {
  try {
    const response = await generateDailyBriefing();
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
    provider: 'anthropic',
    cache: 'daily',
    cacheLayers: ['file', 'platform-data-cache'],
    pipeline: [
      'reality-engine',
      'personal-relevance-engine',
      'daily-briefing-generator'
    ]
  });
}
