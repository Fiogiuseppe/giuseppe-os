import { getSourceAvailability, getSourceProvider, isSourceActive, listSourceProviders } from '../../providers/source-registry';
import { getSourceConfig } from '../../config/source-config';
import type { SourceProviderId, SourceProviderStatus } from '../../providers/source-provider.types';
import { buildDataCollectedModel } from '../models/data-collected';
import { buildPermissionModel } from '../models/permissions';
import { getSourceAdapter } from '../adapter-registry.server';
import { hasCredentials } from '../credentials-vault.server';
import {
  readPersistedConnection,
  seedPersistedConnectionIfMissing
} from './connection-persistence.server';
import { getLatestSyncRun } from './sync-run-persistence.server';

function mapAuthMethod(
  authMethod: ReturnType<typeof getSourceProvider>['authMethod']
): SourceProviderStatus['authMethod'] {
  if (authMethod === 'oauth') {
    return 'oauth';
  }
  if (authMethod === 'feed') {
    return 'feed';
  }
  return 'mock';
}

async function ensureSeeded(sourceId: SourceProviderId): Promise<void> {
  const provider = getSourceProvider(sourceId);
  const seededNote = getSourceConfig(sourceId)?.seededHealthNote;

  if (!isSourceActive(sourceId)) {
    await seedPersistedConnectionIfMissing(sourceId, {
      connectionStatus: 'disconnected',
      healthStatus: 'unknown',
      healthNote: 'Planned integration — coming later.',
      permissionsGranted: [],
      dataCollectionEnabled: []
    });
    return;
  }

  if (seededNote) {
    await seedPersistedConnectionIfMissing(sourceId, {
      connectionStatus: provider.authMethod === 'oauth' ? 'needs_auth' : 'disconnected',
      healthStatus: 'unknown',
      healthNote: seededNote,
      permissionsGranted: [],
      dataCollectionEnabled: []
    });
    return;
  }

  if (hasCredentials(sourceId)) {
    return;
  }

  await seedPersistedConnectionIfMissing(sourceId, {
    connectionStatus: 'disconnected',
    healthStatus: 'unknown',
    healthNote: null,
    permissionsGranted: [],
    dataCollectionEnabled: []
  });
}

export async function buildSafeProviderStatus(sourceId: SourceProviderId): Promise<SourceProviderStatus> {
  await ensureSeeded(sourceId);

  const provider = getSourceProvider(sourceId);
  const adapter = getSourceAdapter(sourceId);
  const health = await adapter.health();
  const permissions = await adapter.permissions();
  const persisted = await readPersistedConnection(sourceId);
  const latestRun = await getLatestSyncRun(sourceId);

  const dataCollected = buildDataCollectedModel(
    sourceId,
    persisted?.dataCollectionEnabled ?? [],
    { connected: persisted?.connectionStatus === 'connected' }
  );

  const permissionModel = buildPermissionModel(sourceId, persisted?.permissionsGranted ?? []);

  return {
    id: provider.id,
    label: provider.label,
    description: provider.description,
    category: provider.category,
    group: provider.group,
    availability: getSourceAvailability(sourceId),
    authMethod: mapAuthMethod(provider.authMethod),
    connectionStatus: persisted?.connectionStatus ?? health.connectionStatus,
    healthStatus: persisted?.healthStatus ?? health.status,
    lastSyncAt: persisted?.lastSyncAt ?? health.lastSyncAt,
    lastSuccessfulSyncAt: persisted?.lastSuccessfulSyncAt ?? null,
    permissions: permissionModel.declared,
    permissionsGranted: permissionModel.granted,
    dataCollected: dataCollected.catalog,
    dataCollectionEnabled: dataCollected.enabled,
    healthNote: persisted?.healthNote ?? health.note,
    lastSyncRun: latestRun
      ? {
          id: latestRun.id,
          status: latestRun.status,
          finishedAt: latestRun.finishedAt,
          fetched: latestRun.fetched,
          normalized: latestRun.normalized,
          evidence: latestRun.evidence,
          mode: latestRun.mode
        }
      : null
  };
}

export async function listSafeProviderStatuses(): Promise<SourceProviderStatus[]> {
  return Promise.all(listSourceProviders().map(provider => buildSafeProviderStatus(provider.id)));
}
