/**
 * @deprecated Use platform/credentials-vault.server.ts
 * Compatibility shim for legacy OAuth imports.
 */

import type { SourceProviderId } from '../providers/source-provider.types';
import type { OAuthSourceProviderId, OAuthTokenBundle } from './oauth.types';
import {
  clearCredentials,
  getCredentials,
  hasCredentials,
  saveCredentials,
  touchCredentialSync
} from '../platform/credentials-vault.server';

export type StoredOAuthConnection = {
  sourceId: SourceProviderId;
  providerId: OAuthSourceProviderId;
  accessToken: string;
  tokenType: string;
  scope: string;
  refreshToken?: string;
  connectedAt: string;
  lastSyncAt: string | null;
};

function toStored(record: NonNullable<ReturnType<typeof getCredentials>>): StoredOAuthConnection {
  if (record.credentials.kind !== 'oauth2') {
    throw new Error('Expected OAuth2 credentials.');
  }

  return {
    sourceId: record.sourceId,
    providerId: record.sourceId as OAuthSourceProviderId,
    accessToken: record.credentials.accessToken,
    tokenType: record.credentials.tokenType,
    scope: record.credentials.scope,
    refreshToken: record.credentials.refreshToken,
    connectedAt: record.connectedAt,
    lastSyncAt: record.lastSyncAt
  };
}

export function saveOAuthConnection(
  sourceId: SourceProviderId,
  providerId: OAuthSourceProviderId,
  tokens: OAuthTokenBundle
): StoredOAuthConnection {
  const record = saveCredentials(sourceId, {
    kind: 'oauth2',
    accessToken: tokens.accessToken,
    tokenType: tokens.tokenType,
    scope: tokens.scope,
    refreshToken: tokens.refreshToken
  });

  void providerId;
  return toStored(record);
}

export function getOAuthConnection(sourceId: SourceProviderId): StoredOAuthConnection | null {
  const record = getCredentials(sourceId);
  if (!record || record.credentials.kind !== 'oauth2') {
    return null;
  }

  return toStored(record);
}

export function hasOAuthConnection(sourceId: SourceProviderId): boolean {
  const record = getCredentials(sourceId);
  return Boolean(record && record.credentials.kind === 'oauth2');
}

export function clearOAuthConnection(sourceId: SourceProviderId): void {
  clearCredentials(sourceId);
}

export function touchOAuthSync(sourceId: SourceProviderId): string | null {
  return touchCredentialSync(sourceId);
}

export { resetCredentialsVaultForTests as resetOAuthVaultForTests } from '../platform/credentials-vault.server';
