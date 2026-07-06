import type { SourceProviderId } from '../config/source-config';

export const OAUTH_STATE_COOKIE = 'giuseppe_sources_oauth_state' as const;

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

/** Server-only token payload — never send to the browser or API clients. */
export type OAuthTokenBundle = {
  accessToken: string;
  tokenType: string;
  scope: string;
  refreshToken?: string;
  expiresAt?: string;
};

export type OAuthAuthorizationRequest = {
  sourceId: SourceProviderId;
  state: string;
  redirectUri: string;
};

export type OAuthCodeExchangeRequest = {
  sourceId: SourceProviderId;
  code: string;
  redirectUri: string;
};

export type OAuthRefreshRequest = {
  sourceId: SourceProviderId;
  refreshToken: string;
};

export type OAuthRevokeRequest = {
  sourceId: SourceProviderId;
  accessToken: string;
};

export type PendingOAuthState = {
  sourceId: SourceProviderId;
  state: string;
  redirectUri: string;
  expiresAt: number;
};

export type OAuthConnectResult =
  | { ok: true; authorizeUrl: string; state: string }
  | { ok: false; status: number; error: string; code: string };

export type OAuthCallbackResult =
  | { ok: true; sourceId: SourceProviderId; redirectTo: string }
  | { ok: false; status: number; error: string; code: string; redirectTo: string };
