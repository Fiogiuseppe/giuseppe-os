import { getOAuthRedirectUri } from '../../../../src/modules/sources/oauth/oauth-flow.server';
import {
  buildOAuthStateCookieHeader,
  buildClearOAuthStateCookieHeader
} from '../../../../src/modules/sources/oauth/oauth-security.server';
import { seedOAuthStateForTests } from '../../../../src/modules/sources/oauth/oauth-state.server';
import { normalizeSourceId } from '../../../../src/modules/sources/config/source-config';
import { isSourceProviderId } from '../../../../src/modules/sources/providers/source-registry';

function isTestRouteEnabled(): boolean {
  return process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test';
}

/** Test-only route to seed OAuth state for callback validation tests. */
export async function POST(request: Request) {
  if (!isTestRouteEnabled()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const sourceIdInput = typeof body.sourceId === 'string' ? body.sourceId : '';
  const normalized = normalizeSourceId(sourceIdInput);

  if (!normalized || !isSourceProviderId(normalized)) {
    return Response.json({ error: 'Invalid sourceId.' }, { status: 400 });
  }

  const expired = body.expired === true;
  const redirectUri = getOAuthRedirectUri();
  const state = seedOAuthStateForTests({
    sourceId: normalized,
    redirectUri,
    expiresAt: expired ? Date.now() - 1_000 : undefined
  });

  const headers = new Headers();
  headers.append('Set-Cookie', buildOAuthStateCookieHeader(state));

  return Response.json({ ok: true, state, sourceId: normalized, expired }, { headers });
}

export async function DELETE() {
  if (!isTestRouteEnabled()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  return Response.json({ ok: true }, {
    headers: {
      'Set-Cookie': buildClearOAuthStateCookieHeader()
    }
  });
}
