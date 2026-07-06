import type { SourceProviderId } from '../config/source-config';
import type {
  OAuthAuthorizationRequest,
  OAuthCodeExchangeRequest,
  OAuthRefreshRequest,
  OAuthRevokeRequest,
  OAuthTokenBundle
} from './oauth.types';

/**
 * Provider adapter contract for future Instagram, LinkedIn, and other OAuth sources.
 * Implementations perform server-side HTTP only — never expose secrets to the client.
 */
export type OAuthProviderAdapter = {
  /** Stable provider key, e.g. `instagram`, `linkedin`. */
  providerId: string;
  /** Canonical source IDs served by this provider adapter. */
  sourceIds: readonly SourceProviderId[];
  buildAuthorizationUrl(input: OAuthAuthorizationRequest): Promise<string> | string;
  exchangeCodeForTokens(input: OAuthCodeExchangeRequest): Promise<OAuthTokenBundle>;
  refreshAccessToken?(input: OAuthRefreshRequest): Promise<OAuthTokenBundle>;
  revokeToken?(input: OAuthRevokeRequest): Promise<void>;
  getGrantedScopes(tokenBundle: OAuthTokenBundle): string[];
};

export type OAuthProviderRegistration = {
  providerId: string;
  adapter: OAuthProviderAdapter;
};
