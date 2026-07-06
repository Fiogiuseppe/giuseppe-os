export const OAUTH_ERROR_CODES = {
  UNSUPPORTED_SOURCE: 'unsupported_source',
  PROVIDER_NOT_IMPLEMENTED: 'provider_not_implemented',
  MISSING_STATE: 'missing_state',
  STATE_MISMATCH: 'state_mismatch',
  STATE_INVALID: 'state_invalid',
  STATE_EXPIRED: 'state_expired',
  STATE_REUSED: 'state_reused',
  MISSING_CODE: 'missing_code',
  PROVIDER_DENIED: 'provider_denied',
  TOKEN_EXCHANGE_FAILED: 'token_exchange_failed'
} as const;

export type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[keyof typeof OAUTH_ERROR_CODES];

export class OAuthError extends Error {
  readonly code: OAuthErrorCode;
  readonly status: number;

  constructor(code: OAuthErrorCode, message: string, status = 400) {
    super(message);
    this.name = 'OAuthError';
    this.code = code;
    this.status = status;
  }
}

export function mapOAuthError(error: unknown): { code: OAuthErrorCode; message: string; status: number } {
  if (error instanceof OAuthError) {
    return { code: error.code, message: error.message, status: error.status };
  }

  return {
    code: OAUTH_ERROR_CODES.STATE_INVALID,
    message: error instanceof Error ? error.message : 'OAuth request failed.',
    status: 400
  };
}
