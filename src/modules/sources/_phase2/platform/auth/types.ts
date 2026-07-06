import type { OAuth2Credentials } from '../types';

export type OAuth2AuthorizeParams = {
  state: string;
  redirectUri: string;
};

export type OAuth2ExchangeParams = {
  code: string;
  redirectUri: string;
};

export type OAuth2TokenBundle = {
  accessToken: string;
  tokenType: string;
  scope: string;
  refreshToken?: string;
  expiresAt?: string;
};

/** OAuth2 strategy contract — provider-agnostic. */
export interface OAuth2Strategy {
  readonly strategyId: string;
  isConfigured(): boolean;
  buildAuthorizeUrl(params: OAuth2AuthorizeParams): string;
  exchangeCode(params: OAuth2ExchangeParams): Promise<OAuth2TokenBundle>;
  refreshTokens?(credentials: OAuth2Credentials): Promise<OAuth2TokenBundle>;
}

export type FeedValidationResult = { ok: true } | { ok: false; message: string };

/** RSS / public feed strategy — no secrets. */
export interface FeedAuthStrategy {
  readonly strategyId: string;
  validate?(feedUrl: string): Promise<FeedValidationResult>;
}

export type ApiKeyValidationResult = { ok: true } | { ok: false; message: string };

export interface ApiKeyAuthStrategy {
  readonly strategyId: string;
  validateKey(apiKey: string): Promise<ApiKeyValidationResult>;
}

export interface FileImportAuthStrategy {
  readonly strategyId: string;
  acceptedMimeTypes: string[];
}

export interface WebhookAuthStrategy {
  readonly strategyId: string;
  verifySignature(payload: string, signature: string, secret: string): boolean;
}

export interface CustomAuthStrategy {
  readonly strategyId: string;
  description: string;
}
