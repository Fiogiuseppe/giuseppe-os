import type { SourceProviderId } from '../providers/source-provider.types';
import type { PlatformConnectionStatus, PlatformHealthStatus } from './types';
import {
  deletePersistedConnection,
  readPersistedConnection,
  writePersistedConnection
} from './engine/connection-persistence.server';

export type ConnectionStateRecord = {
  connectionStatus: PlatformConnectionStatus;
  healthStatus: PlatformHealthStatus;
  lastSyncAt: string | null;
  permissionsGranted: string[];
  healthNote: string | null;
  syncCursor: string | null;
};

function toStateRecord(
  sourceId: SourceProviderId,
  record: NonNullable<Awaited<ReturnType<typeof readPersistedConnection>>>
): ConnectionStateRecord {
  void sourceId;
  return {
    connectionStatus: record.connectionStatus,
    healthStatus: record.healthStatus,
    lastSyncAt: record.lastSyncAt,
    permissionsGranted: record.permissionsGranted,
    healthNote: record.healthNote,
    syncCursor: record.syncCursor
  };
}

export async function readConnectionState(
  sourceId: SourceProviderId
): Promise<ConnectionStateRecord | null> {
  const record = await readPersistedConnection(sourceId);
  return record ? toStateRecord(sourceId, record) : null;
}

export async function writeConnectionState(
  sourceId: SourceProviderId,
  patch: Partial<ConnectionStateRecord> & {
    connectionStatus?: PlatformConnectionStatus;
    healthStatus?: PlatformHealthStatus;
  }
): Promise<ConnectionStateRecord> {
  const existing = await readPersistedConnection(sourceId);
  const record = await writePersistedConnection(sourceId, {
    connectionStatus: patch.connectionStatus ?? existing?.connectionStatus ?? 'disconnected',
    healthStatus: patch.healthStatus ?? existing?.healthStatus ?? 'unknown',
    lastSyncAt: patch.lastSyncAt ?? existing?.lastSyncAt ?? null,
    permissionsGranted: patch.permissionsGranted ?? existing?.permissionsGranted ?? [],
    dataCollectionEnabled: existing?.dataCollectionEnabled ?? [],
    healthNote: patch.healthNote ?? existing?.healthNote ?? null,
    syncCursor: patch.syncCursor ?? existing?.syncCursor ?? null,
    connectedAt: existing?.connectedAt ?? null
  });

  return toStateRecord(sourceId, record);
}

export async function clearConnectionState(sourceId: SourceProviderId): Promise<void> {
  await deletePersistedConnection(sourceId);
}

export async function resetConnectionStateForTests(): Promise<void> {
  const { resetSourceEngineStoreForTests } = await import('./store');
  await resetSourceEngineStoreForTests();
}
