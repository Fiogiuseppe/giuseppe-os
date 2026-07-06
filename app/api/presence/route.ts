import { runPresenceScan } from '../../../lib/presence/run';

function parseLocale(searchParams: URLSearchParams): 'it' | 'en' {
  return searchParams.get('locale') === 'en' ? 'en' : 'it';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams);
  const regenerate = url.searchParams.get('regenerate') === 'true';

  try {
    const report = await runPresenceScan(locale, { regenerate });
    return Response.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Presence scan failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { 'X-Giuseppe-Service': 'presence-engine' }
  });
}
