import { normalizeSourceId } from '../config/source-config';
import type { SourceProviderId } from '../config/source-config';
import { isSourceProviderId } from '../providers/source-registry';
import { ensureOAuthProvidersBootstrapped } from './oauth-bootstrap.server';
import { completeOAuthConnection } from './oauth-connection.server';
import { OAUTH_ERROR_CODES, mapOAuthError } from './oauth-errors';
import {
  getOAuthProviderForSource,
  isOAuthCapableSource
} from './oauth-registry.server';
import {
  buildClearOAuthStateCookieHeader,
  buildOAuthStateCookieHeader,
  sanitizeOAuthRedirectError
} from './oauth-security.server';
import { consumeOAuthState, createOAuthState, validateOAuthState } from './oauth-state.server';
import type { OAuthCallbackResult, OAuthConnectResult } from './oauth.types';

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

export function getSourcesDashboardUrl(query?: Record<string, string>): string {
  const url = new URL('/sources', getAppBaseUrl());
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function beginOAuthConnect(sourceIdInput: string): Promise<{
  result: OAuthConnectResult;
  headers: Headers;
}> {
  ensureOAuthProvidersBootstrapped();
  const headers = new Headers();
  const normalized = normalizeSourceId(sourceIdInput);

  if (!normalized || !isSourceProviderId(normalized)) {
    return {
      result: {
        ok: false,
        status: 404,
        code: OAUTH_ERROR_CODES.UNSUPPORTED_SOURCE,
        error: 'Unknown source provider.'
      },
      headers
    };
  }

  const sourceId = normalized as SourceProviderId;

  if (!isOAuthCapableSource(sourceId)) {
    return {
      result: {
        ok: false,
        status: 400,
        code: OAUTH_ERROR_CODES.UNSUPPORTED_SOURCE,
        error: 'Source does not support OAuth.'
      },
      headers
    };
  }

  const provider = getOAuthProviderForSource(sourceId);
  if (!provider) {
    return {
      result: {
        ok: false,
        status: 501,
        code: OAUTH_ERROR_CODES.PROVIDER_NOT_IMPLEMENTED,
        error: 'OAuth provider not implemented.'
      },
      headers
    };
  }

  const redirectUri = getOAuthRedirectUri();
  const state = createOAuthState({ sourceId, redirectUri });
  headers.append('Set-Cookie', buildOAuthStateCookieHeader(state));

  const authorizeUrl = await provider.buildAuthorizationUrl({
    sourceId,
    state,
    redirectUri
  });

  return {
    result: {
      ok: true,
      authorizeUrl,
      state
    },
    headers
  };
}

export async function handleOAuthCallback(request: Request): Promise<{
  result: OAuthCallbackResult;
  headers: Headers;
}> {
  ensureOAuthProvidersBootstrapped();
  const headers = new Headers();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');
  const redirectUri = getOAuthRedirectUri();

  if (oauthError) {
    return {
      result: {
        ok: false,
        status: 400,
        code: OAUTH_ERROR_CODES.PROVIDER_DENIED,
        error: `OAuth denied: ${oauthError}`,
        redirectTo: getSourcesDashboardUrl({
          oauth_error: sanitizeOAuthRedirectError(oauthError)
        })
      },
      headers
    };
  }

  if (!code?.trim()) {
    return {
      result: {
        ok: false,
        status: 400,
        code: OAUTH_ERROR_CODES.MISSING_CODE,
        error: 'Missing authorization code.',
        redirectTo: getSourcesDashboardUrl({ oauth_error: OAUTH_ERROR_CODES.MISSING_CODE })
      },
      headers
    };
  }

  let pending;

  try {
    pending = validateOAuthState({
      stateFromQuery: state,
      cookieHeader: request.headers.get('cookie'),
      redirectUri
    });
  } catch (error) {
    const mapped = mapOAuthError(error);

    return {
      result: {
        ok: false,
        status: mapped.status,
        code: mapped.code,
        error: mapped.message,
        redirectTo: getSourcesDashboardUrl({ oauth_error: sanitizeOAuthRedirectError(mapped.code) })
      },
      headers
    };
  }

  consumeOAuthState(pending.state);
  headers.append('Set-Cookie', buildClearOAuthStateCookieHeader());

  const provider = getOAuthProviderForSource(pending.sourceId);
  if (!provider) {
    return {
      result: {
        ok: false,
        status: 501,
        code: OAUTH_ERROR_CODES.PROVIDER_NOT_IMPLEMENTED,
        error: 'OAuth provider not implemented.',
        redirectTo: getSourcesDashboardUrl({
          oauth_error: OAUTH_ERROR_CODES.PROVIDER_NOT_IMPLEMENTED
        })
      },
      headers
    };
  }

  try {
    const tokenBundle = await provider.exchangeCodeForTokens({
      sourceId: pending.sourceId,
      code: code.trim(),
      redirectUri
    });

    const scopes = provider.getGrantedScopes(tokenBundle);
    await completeOAuthConnection({
      sourceId: pending.sourceId,
      tokenBundle,
      scopes
    });

    return {
      result: {
        ok: true,
        sourceId: pending.sourceId,
        redirectTo: getSourcesDashboardUrl({ connected: pending.sourceId })
      },
      headers
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth token exchange failed.';
    return {
      result: {
        ok: false,
        status: 502,
        code: OAUTH_ERROR_CODES.TOKEN_EXCHANGE_FAILED,
        error: message,
        redirectTo: getSourcesDashboardUrl({
          oauth_error: OAUTH_ERROR_CODES.TOKEN_EXCHANGE_FAILED
        })
      },
      headers
    };
  }
}
