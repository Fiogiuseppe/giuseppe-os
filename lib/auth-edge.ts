export const AUTH_COOKIE = 'giuseppe_os_session';
const SESSION_MESSAGE = 'giuseppe-os-authenticated';

async function getSessionToken(): Promise<string | null> {
  const secret = process.env.GIUSEPPE_OS_AUTH_SECRET;
  if (!secret) return null;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(SESSION_MESSAGE));

  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  const expected = await getSessionToken();
  if (!expected || !token) return false;
  if (token.length !== expected.length) return false;

  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }

  return mismatch === 0;
}
