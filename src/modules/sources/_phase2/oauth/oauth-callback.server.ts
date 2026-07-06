import { consumeOAuthState, validateOAuthState } from '../oauth/oauth-state.server';
import { completeOAuthConnect } from '../platform/platform.server';
import { isOAuth2Source } from '../platform/adapter-registry.server';
import type { SourceProviderId } from '../providers/source-provider.types';

export type OAuthCallbackResult =
  | { ok: true; sourceId: SourceProviderId }
  | { ok: false; status: number; error: string };

export function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export function getOAuthRedirectUri(): string {
  return `${getAppBaseUrl()}/api/sources/oauth/callback`;
}

export async function handleOAuthCallback(request: Request): Promise<OAuthCallbackResult> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    return { ok: false, status: 400, error: `OAuth denied: ${oauthError}` };
  }

  if (!code?.trim()) {
    return { ok: false, status: 400, error: 'Missing authorization code.' };
  }

  let pending;

  try {
    pending = validateOAuthState({
      stateFromQuery: state,
      cookieHeader: request.headers.get('cookie')
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid OAuth state.';
    return { ok: false, status: 400, error: message };
  }

  const sourceId = pending.providerId as SourceProviderId;

  if (!isOAuth2Source(sourceId)) {
    return { ok: false, status: 400, error: 'Unknown OAuth source.' };
  }

  try {
    await completeOAuthConnect(sourceId, {
      authorizationCode: code.trim(),
      redirectUri: getOAuthRedirectUri()
    });
    consumeOAuthState(pending.state);

    return { ok: true, sourceId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth token exchange failed.';
    return { ok: false, status: 502, error: message };
  }
}
