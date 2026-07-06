import type { SourceProviderId } from '../../providers/source-provider.types';
import type { ConnectionStatus, HealthStatus } from '../../providers/source-provider.types';
import { getSourceEngineStore } from '../store';
import type { PersistedConnectionRecord } from '../store/types';
import { defaultEnabledDataCollection } from '../models/data-collected';
import { defaultGrantedPermissions } from '../models/permissions';

export type ConnectionPatch = Partial<
  Pick<
    PersistedConnectionRecord,
    | 'connectionStatus'
    | 'healthStatus'
    | 'lastSyncAt'
    | 'lastSuccessfulSyncAt'
    | 'permissionsGranted'
    | 'dataCollectionEnabled'
    | 'healthNote'
    | 'syncCursor'
    | 'connectedAt'
  >
>;

export async function readPersistedConnection(
  sourceId: SourceProviderId
): Promise<PersistedConnectionRecord | null> {
  return getSourceEngineStore().getConnection(sourceId);
}

export async function writePersistedConnection(
  sourceId: SourceProviderId,
  patch: ConnectionPatch & {
    connectionStatus: ConnectionStatus;
    healthStatus: HealthStatus;
  }
): Promise<PersistedConnectionRecord> {
  const existing = await getSourceEngineStore().getConnection(sourceId);
  const now = new Date().toISOString();

  return getSourceEngineStore().upsertConnection({
    sourceId,
    connectionStatus: patch.connectionStatus,
    healthStatus: patch.healthStatus,
    lastSyncAt: patch.lastSyncAt ?? existing?.lastSyncAt ?? null,
    lastSuccessfulSyncAt: patch.lastSuccessfulSyncAt ?? existing?.lastSuccessfulSyncAt ?? null,
    permissionsGranted: patch.permissionsGranted ?? existing?.permissionsGranted ?? [],
    dataCollectionEnabled:
      patch.dataCollectionEnabled ??
      existing?.dataCollectionEnabled ??
      defaultEnabledDataCollection(sourceId),
    healthNote: patch.healthNote ?? existing?.healthNote ?? null,
    syncCursor: patch.syncCursor ?? existing?.syncCursor ?? null,
    connectedAt: patch.connectedAt ?? existing?.connectedAt ?? null,
    updatedAt: now
  });
}

export async function deletePersistedConnection(sourceId: SourceProviderId): Promise<void> {
  await getSourceEngineStore().deleteConnection(sourceId);
}

export async function seedPersistedConnectionIfMissing(
  sourceId: SourceProviderId,
  seed: ConnectionPatch & {
    connectionStatus: ConnectionStatus;
    healthStatus: HealthStatus;
    healthNote?: string | null;
  }
): Promise<PersistedConnectionRecord> {
  const existing = await readPersistedConnection(sourceId);
  if (existing) {
    return existing;
  }

  return writePersistedConnection(sourceId, {
    connectionStatus: seed.connectionStatus,
    healthStatus: seed.healthStatus,
    healthNote: seed.healthNote ?? null,
    permissionsGranted: seed.permissionsGranted ?? defaultGrantedPermissions(sourceId),
    dataCollectionEnabled: seed.dataCollectionEnabled ?? [],
    lastSyncAt: null,
    lastSuccessfulSyncAt: null,
    syncCursor: null,
    connectedAt: null
  });
}
