/**
 * Server-only credential vault.
 * Access tokens, refresh tokens, API keys, and webhook secrets never leave the server.
 * TODO: encrypted Supabase persistence + rotation audit log.
 */

import type { SourceProviderId } from '../providers/source-provider.types';
import type { StoredCredentials } from './types';

export type CredentialRecord = {
  sourceId: SourceProviderId;
  credentials: StoredCredentials;
  connectedAt: string;
  lastSyncAt: string | null;
  lastRefreshAt: string | null;
};

const vault = new Map<SourceProviderId, CredentialRecord>();

export function saveCredentials(
  sourceId: SourceProviderId,
  credentials: StoredCredentials
): CredentialRecord {
  const now = new Date().toISOString();
  const existing = vault.get(sourceId);

  const record: CredentialRecord = {
    sourceId,
    credentials,
    connectedAt: existing?.connectedAt ?? now,
    lastSyncAt: existing?.lastSyncAt ?? now,
    lastRefreshAt: credentials.kind === 'oauth2' ? now : existing?.lastRefreshAt ?? null
  };

  vault.set(sourceId, record);
  return record;
}

export function getCredentials(sourceId: SourceProviderId): CredentialRecord | null {
  return vault.get(sourceId) ?? null;
}

export function hasCredentials(sourceId: SourceProviderId): boolean {
  return vault.has(sourceId);
}

export function clearCredentials(sourceId: SourceProviderId): void {
  vault.delete(sourceId);
}

export function touchCredentialSync(sourceId: SourceProviderId): string | null {
  const current = vault.get(sourceId);
  if (!current) {
    return null;
  }

  const lastSyncAt = new Date().toISOString();
  vault.set(sourceId, { ...current, lastSyncAt });
  return lastSyncAt;
}

export function resetCredentialsVaultForTests(): void {
  vault.clear();
}
