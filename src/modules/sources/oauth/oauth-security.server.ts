import { OAUTH_STATE_COOKIE } from './oauth.types';

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function buildOAuthStateCookieHeader(state: string): string {
  const secure = isProductionRuntime();
  const parts = [
    `${OAUTH_STATE_COOKIE}=${encodeURIComponent(state)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600'
  ];

  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function buildClearOAuthStateCookieHeader(): string {
  const secure = isProductionRuntime();
  const parts = [`${OAUTH_STATE_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];

  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function sanitizeOAuthRedirectError(value: string | null): string {
  if (!value?.trim()) {
    return 'oauth_failed';
  }

  return value.trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}
