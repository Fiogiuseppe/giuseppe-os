import type { SourceProviderId } from '../providers/source-provider.types';
import { isOAuth2Source } from '../platform/adapter-registry.server';

/** OAuth source IDs — derived from registered OAuth2 adapters. */
export const OAUTH_SOURCE_PROVIDER_IDS = ['github'] as const;

export type OAuthSourceProviderId = (typeof OAUTH_SOURCE_PROVIDER_IDS)[number];

export type OAuthAuthorizeParams = {
  state: string;
  redirectUri: string;
};

export type OAuthCodeExchangeParams = {
  code: string;
  redirectUri: string;
};

/** Server-only token payload — never send to the browser. */
export type OAuthTokenBundle = {
  accessToken: string;
  tokenType: string;
  scope: string;
  refreshToken?: string;
};

export function isOAuthSourceProviderId(value: string): value is OAuthSourceProviderId {
  return isOAuth2Source(value as SourceProviderId);
}

export function getOAuthProviderForSource(sourceId: SourceProviderId): { sourceId: SourceProviderId } | null {
  return isOAuth2Source(sourceId) ? { sourceId } : null;
}
