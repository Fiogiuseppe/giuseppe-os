import { NextResponse } from 'next/server';
import { beginOAuthConnect } from '../../../../../src/modules/sources/oauth/oauth-flow.server';
import { normalizeSourceId } from '../../../../../src/modules/sources/config/source-config';

type RouteContext = {
  params: Promise<{ provider: string }>;
};

/** Phase 12 — begin OAuth connect for OAuth-capable sources. No tokens returned. */
export async function GET(_request: Request, context: RouteContext) {
  const { provider } = await context.params;
  const sourceId = normalizeSourceId(provider) ?? provider;
  const { result, headers } = await beginOAuthConnect(sourceId);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code, sourceId },
      { status: result.status, headers }
    );
  }

  const response = NextResponse.redirect(result.authorizeUrl, { status: 302 });
  for (const [key, value] of headers.entries()) {
    response.headers.append(key, value);
  }
  return response;
}
