import { generateMemorySuggestions } from '../../../../lib/memory/suggestions/generate';

function parseLocale(searchParams: URLSearchParams): 'it' | 'en' {
  return searchParams.get('locale') === 'en' ? 'en' : 'it';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams);

  try {
    const response = await generateMemorySuggestions(locale);
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Memory suggestions failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
