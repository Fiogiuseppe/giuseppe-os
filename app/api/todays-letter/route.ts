import { MAX_LETTER_WORDS } from '../../../lib/todays-letter/prompt';
import { generateTodaysLetter, mapTodaysLetterError } from '../../../lib/todays-letter/generate';

export async function POST() {
  try {
    const response = await generateTodaysLetter();
    return Response.json(response);
  } catch (error) {
    const mapped = mapTodaysLetterError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-intelligence-pipeline',
    version: '1.6.0-intelligence-pipeline',
    method: 'POST',
    maxWords: MAX_LETTER_WORDS,
    provider: 'anthropic',
    cache: 'daily',
    cacheLayers: ['file', 'platform-data-cache'],
    pipeline: ['reality-engine', 'personal-relevance-engine', 'todays-letter-generator']
  });
}
