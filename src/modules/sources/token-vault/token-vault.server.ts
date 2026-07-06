import type { OAuthTokenBundle } from '../oauth/oauth.types';
import type { SourceProviderId } from '../config/source-config';
import { decryptToken, encryptToken, productionRequiresEncryptionKey } from './token-encryption.server';
import { getTokenVaultStore } from './token-vault-store.server';
import {
  TokenVaultError,
  toSafeTokenMetadata,
  type DecryptedTokenBundle,
  type PersistedOAuthTokenRecord,
  type SafeTokenMetadata,
  type SaveTokenBundleInput
} from './token-vault.types';

function parseScopes(scope: string | string[]): string[] {
  if (Array.isArray(scope)) {
    return scope.filter(Boolean);
  }

  return scope
    .split(/[\s,]+/)
    .map(part => part.trim())
    .filter(Boolean);
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const expires = new Date(expiresAt).getTime();
  return Number.isFinite(expires) && expires <= Date.now();
}

function toDecryptedBundle(record: PersistedOAuthTokenRecord): DecryptedTokenBundle {
  return {
    sourceId: record.sourceId,
    provider: record.provider,
    providerAccountId: record.providerAccountId,
    accessToken: decryptToken(record.encryptedAccessToken),
    refreshToken: record.encryptedRefreshToken ? decryptToken(record.encryptedRefreshToken) : null,
    tokenType: record.tokenType,
    scopes: [...record.scopes],
    expiresAt: record.expiresAt
  };
}

/** Persist encrypted OAuth tokens — server-side only. */
export async function saveTokenBundle(input: SaveTokenBundleInput): Promise<SafeTokenMetadata> {
  const store = getTokenVaultStore();
  const now = new Date().toISOString();
  const existing = await store.getBySourceId(input.sourceId);

  const record: PersistedOAuthTokenRecord = {
    sourceId: input.sourceId,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
    encryptedAccessToken: encryptToken(input.accessToken),
    encryptedRefreshToken: input.refreshToken ? encryptToken(input.refreshToken) : null,
    tokenType: input.tokenType,
    scopes: [...input.scopes],
    expiresAt: input.expiresAt ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    revokedAt: null
  };

  const saved = await store.upsert(record);
  return toSafeTokenMetadata(saved);
}

/** OAuth callback integration hook — maps provider token bundle to vault storage. */
export async function saveTokenBundleFromOAuth(input: {
  sourceId: SourceProviderId;
  provider: string;
  providerAccountId: string;
  tokenBundle: OAuthTokenBundle;
}): Promise<SafeTokenMetadata> {
  return saveTokenBundle({
    sourceId: input.sourceId,
    provider: input.provider,
    providerAccountId: input.providerAccountId,
    accessToken: input.tokenBundle.accessToken,
    refreshToken: input.tokenBundle.refreshToken ?? null,
    tokenType: input.tokenBundle.tokenType,
    scopes: parseScopes(input.tokenBundle.scope),
    expiresAt: input.tokenBundle.expiresAt ?? null
  });
}

/** Return decrypted tokens for server-side connector use only. */
export async function getValidTokenBundle(
  sourceId: SourceProviderId
): Promise<DecryptedTokenBundle | null> {
  const record = await getTokenVaultStore().getBySourceId(sourceId);

  if (!record || record.revokedAt) {
    return null;
  }

  if (isExpired(record.expiresAt)) {
    return null;
  }

  return toDecryptedBundle(record);
}

export async function markTokenRevoked(sourceId: SourceProviderId): Promise<SafeTokenMetadata | null> {
  const store = getTokenVaultStore();
  const existing = await store.getBySourceId(sourceId);

  if (!existing) {
    return null;
  }

  const updated: PersistedOAuthTokenRecord = {
    ...existing,
    revokedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = await store.upsert(updated);
  return toSafeTokenMetadata(saved);
}

export async function deleteTokenBundle(sourceId: SourceProviderId): Promise<boolean> {
  return getTokenVaultStore().deleteBySourceId(sourceId);
}

export async function listTokenMetadata(): Promise<SafeTokenMetadata[]> {
  const records = await getTokenVaultStore().listAll();
  return records.map(toSafeTokenMetadata);
}

export async function getTokenMetadata(
  sourceId: SourceProviderId
): Promise<SafeTokenMetadata | null> {
  const record = await getTokenVaultStore().getBySourceId(sourceId);
  return record ? toSafeTokenMetadata(record) : null;
}

export function assertTokenVaultReadyForProduction(): void {
  if (productionRequiresEncryptionKey()) {
    throw new TokenVaultError(
      'SOURCES_TOKEN_ENCRYPTION_KEY is required in production.',
      'encryption_key_missing'
    );
  }
}
