import { resolveAIMode, resolveConfiguredAiProvider } from '../../../lib/ai/mode';
import { generateTodayExperience, mapTodayError } from '../../../lib/today/generate';

function parseLocale(searchParams: URLSearchParams): 'it' | 'en' {
  return searchParams.get('locale') === 'en' ? 'en' : 'it';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams);
  const regenerate = url.searchParams.get('regenerate') === 'true';

  try {
    const response = await generateTodayExperience(locale, { regenerate });
    return Response.json(response);
  } catch (error) {
    const mapped = mapTodayError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Giuseppe-Service': 'today-engine',
      'X-AI-Mode': resolveAIMode(),
      'X-AI-Provider': resolveConfiguredAiProvider()
    }
  });
}
