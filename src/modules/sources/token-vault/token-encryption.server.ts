import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { TokenVaultError } from './token-vault.types';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

function deriveKeyFromEnv(raw: string): Buffer {
  const trimmed = raw.trim();

  try {
    const decoded = Buffer.from(trimmed, 'base64');
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // fall through to hash derivation
  }

  return createHash('sha256').update(trimmed).digest();
}

export function isEncryptionKeyConfigured(): boolean {
  return Boolean(process.env.SOURCES_TOKEN_ENCRYPTION_KEY?.trim());
}

export function assertEncryptionKeyAvailable(): void {
  if (isEncryptionKeyConfigured()) {
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new TokenVaultError(
      'SOURCES_TOKEN_ENCRYPTION_KEY is required in production.',
      'encryption_key_missing'
    );
  }

  if (process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test') {
    return;
  }

  throw new TokenVaultError(
    'SOURCES_TOKEN_ENCRYPTION_KEY is not configured.',
    'encryption_key_missing'
  );
}

export function resolveEncryptionKey(): Buffer {
  const configured = process.env.SOURCES_TOKEN_ENCRYPTION_KEY?.trim();

  if (configured) {
    return deriveKeyFromEnv(configured);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new TokenVaultError(
      'SOURCES_TOKEN_ENCRYPTION_KEY is required in production.',
      'encryption_key_missing'
    );
  }

  if (process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test') {
    return createHash('sha256').update('giuseppe-os-test-token-vault-key').digest();
  }

  throw new TokenVaultError(
    'SOURCES_TOKEN_ENCRYPTION_KEY is not configured.',
    'encryption_key_missing'
  );
}

export function encryptToken(plaintext: string): string {
  assertEncryptionKeyAvailable();
  const key = resolveEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptToken(payload: string): string {
  assertEncryptionKeyAvailable();
  const key = resolveEncryptionKey();
  const [ivB64, tagB64, dataB64] = payload.split(':');

  if (!ivB64 || !tagB64 || !dataB64) {
    throw new TokenVaultError('Encrypted token payload is invalid.', 'decryption_failed');
  }

  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    throw new TokenVaultError('Failed to decrypt token payload.', 'decryption_failed');
  }
}

export function isEncryptedTokenPayload(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts.every(part => part.length > 0);
}
