import type { OAuth2ExchangeParams, OAuth2Strategy, OAuth2TokenBundle } from '../platform/auth/types';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_SCOPES = 'read:user,public_repo';

function readClientId(): string {
  const configured = process.env.GITHUB_CLIENT_ID?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.ALLOW_TEST_ROUTES === '1') {
    return 'test_github_client';
  }

  return '';
}

function readClientSecret(): string {
  const configured = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.ALLOW_TEST_ROUTES === '1') {
    return 'test_github_secret';
  }

  return '';
}

function isMockExchangeEnabled(): boolean {
  return (
    process.env.SOURCES_OAUTH_MOCK_EXCHANGE === '1' || process.env.ALLOW_TEST_ROUTES === '1'
  );
}

/** Reference OAuth2 strategy — registered through the adapter registry, not hardcoded in routes. */
export const githubOAuth2Strategy: OAuth2Strategy = {
  strategyId: 'github',

  isConfigured() {
    return Boolean(readClientId() && readClientSecret());
  },

  buildAuthorizeUrl({ state, redirectUri }) {
    const clientId = readClientId();
    if (!clientId) {
      throw new Error('GITHUB_CLIENT_ID is not configured.');
    }

    const url = new URL(GITHUB_AUTHORIZE_URL);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', GITHUB_SCOPES);
    url.searchParams.set('state', state);
    url.searchParams.set('allow_signup', 'false');
    return url.toString();
  },

  async exchangeCode({ code, redirectUri }: OAuth2ExchangeParams): Promise<OAuth2TokenBundle> {
    if (isMockExchangeEnabled() && code === 'mock_authorization_code') {
      return {
        accessToken: 'mock_github_access_token_server_only',
        tokenType: 'bearer',
        scope: GITHUB_SCOPES
      };
    }

    const clientId = readClientId();
    const clientSecret = readClientSecret();

    if (!clientId || !clientSecret) {
      throw new Error('GitHub OAuth is not configured.');
    }

    const response = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub token exchange failed with HTTP ${response.status}.`);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (payload.error || !payload.access_token) {
      throw new Error(payload.error_description ?? payload.error ?? 'GitHub token exchange failed.');
    }

    return {
      accessToken: payload.access_token,
      tokenType: payload.token_type ?? 'bearer',
      scope: payload.scope ?? GITHUB_SCOPES
    };
  }
};
