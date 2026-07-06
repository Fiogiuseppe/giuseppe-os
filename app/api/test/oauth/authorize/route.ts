import { isTestOAuthProviderEnabled } from '../../../../../src/modules/sources/oauth/test-oauth-provider.server';
import { TEST_OAUTH_AUTHORIZATION_CODE } from '../../../../../src/modules/sources/oauth/test-oauth-provider.server';

function isTestRouteEnabled(): boolean {
  return process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test';
}

/** Simulated OAuth provider consent — redirects back to callback with a fake code. */
export async function GET(request: Request) {
  if (!isTestRouteEnabled() || !isTestOAuthProviderEnabled()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const redirectUri = url.searchParams.get('redirect_uri');

  if (!state?.trim() || !redirectUri?.trim()) {
    return Response.json({ error: 'Missing state or redirect_uri.' }, { status: 400 });
  }

  const callback = new URL(redirectUri);
  callback.searchParams.set('code', TEST_OAUTH_AUTHORIZATION_CODE);
  callback.searchParams.set('state', state);

  return Response.redirect(callback.toString(), 302);
}
