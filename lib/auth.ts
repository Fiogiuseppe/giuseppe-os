import crypto from 'crypto';

export const AUTH_COOKIE = 'giuseppe_os_session';
const SESSION_MESSAGE = 'giuseppe-os-authenticated';

export function getSessionToken(): string | null {
  const secret = process.env.GIUSEPPE_OS_AUTH_SECRET;
  if (!secret) return null;

  return crypto.createHmac('sha256', secret).update(SESSION_MESSAGE).digest('hex');
}

export function isValidSessionToken(token: string | undefined): boolean {
  const expected = getSessionToken();
  if (!expected || !token) return false;
  if (token.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
