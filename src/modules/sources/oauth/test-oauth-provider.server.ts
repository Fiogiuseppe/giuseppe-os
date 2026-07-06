import type { SourceProviderId } from '../config/source-config';
import { getSourceConfig } from '../config/source-config';
import type { OAuthProviderAdapter } from './oauth-provider.types';
import type { OAuthCodeExchangeRequest, OAuthTokenBundle } from './oauth.types';

function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}

export const TEST_OAUTH_PROVIDER_ID = 'test_oauth' as const;

export const TEST_OAUTH_AUTHORIZATION_CODE = 'test-oauth-authorization-code' as const;

export const TEST_OAUTH_ACCESS_TOKEN = 'fake-test-access-token-oauth-phase-14' as const;

export const TEST_OAUTH_REFRESH_TOKEN = 'fake-test-refresh-token-oauth-phase-14' as const;

const TEST_OAUTH_SOURCE_IDS: SourceProviderId[] = [
  'instagram_personal',
  'linkedin_personal',
  'instagram_urees'
];

function resolveProviderSlug(sourceId: SourceProviderId): string {
  if (sourceId.includes('linkedin')) {
    return 'linkedin';
  }

  if (sourceId.includes('instagram')) {
    return 'instagram';
  }

  return TEST_OAUTH_PROVIDER_ID;
}

function scopesForSource(sourceId: SourceProviderId): string[] {
  const config = getSourceConfig(sourceId);
  if (!config) {
    return ['read:test'];
  }

  return config.permissions.slice(0, 2).map(permission => permission.toLowerCase().replace(/\s+/g, '_'));
}

export function isTestOAuthProviderEnabled(): boolean {
  return process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test';
}

export function createTestOAuthProvider(): OAuthProviderAdapter {
  return {
    providerId: TEST_OAUTH_PROVIDER_ID,
    sourceIds: TEST_OAUTH_SOURCE_IDS,

    buildAuthorizationUrl(input) {
      const url = new URL(`${getAppBaseUrl()}/api/test/oauth/authorize`);
      url.searchParams.set('state', input.state);
      url.searchParams.set('redirect_uri', input.redirectUri);
      url.searchParams.set('source_id', input.sourceId);
      return url.toString();
    },

    async exchangeCodeForTokens(input: OAuthCodeExchangeRequest): Promise<OAuthTokenBundle> {
      if (input.code !== TEST_OAUTH_AUTHORIZATION_CODE) {
        throw new Error('Invalid test OAuth authorization code.');
      }

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      return {
        accessToken: TEST_OAUTH_ACCESS_TOKEN,
        refreshToken: TEST_OAUTH_REFRESH_TOKEN,
        tokenType: 'Bearer',
        scope: scopesForSource(input.sourceId).join(' '),
        expiresAt
      };
    },

    async revokeToken(): Promise<void> {
      // Simulated revoke — no external API.
    },

    getGrantedScopes(tokenBundle: OAuthTokenBundle): string[] {
      return tokenBundle.scope
        .split(/[\s,]+/)
        .map(scope => scope.trim())
        .filter(Boolean);
    }
  };
}

export function resolveOAuthProviderAccountId(sourceId: SourceProviderId): string {
  return `test-oauth-account-${sourceId}`;
}

export function resolveOAuthProviderSlugForVault(sourceId: SourceProviderId): string {
  return resolveProviderSlug(sourceId);
}
