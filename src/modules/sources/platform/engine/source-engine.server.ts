import { getSourceAvailability, getSourceProvider, isSourceActive, listSourceProviders } from '../../providers/source-registry';
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

const SEEDED_NOTES: Partial<Record<SourceProviderId, string>> = {
  instagram: 'OAuth not configured — Phase 11.',
  linkedin: 'OAuth not configured — Phase 12.',
  medium: 'Feed connector not wired — Phase 5.',
  website: 'Website connector not wired — Phase 3.',
  'urees-website': 'Website connector not wired — Phase 4.',
  'urees-instagram': 'OAuth not configured — Phase 11.'
};

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
  const seededNote = SEEDED_NOTES[sourceId];

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
  const permissionModel = buildPermissionModel(sourceId, permissions.granted);
  const dataModel = buildDataCollectedModel(
    sourceId,
    persisted?.dataCollectionEnabled ?? [],
    { connected: health.connectionStatus === 'connected' }
  );
  const lastSyncRun = await getLatestSyncRun(sourceId);

  return {
    id: provider.id,
    label: provider.label,
    description: provider.description,
    category: provider.category,
    group: provider.group,
    availability: getSourceAvailability(sourceId),
    authMethod: mapAuthMethod(provider.authMethod),
    connectionStatus: health.connectionStatus,
    healthStatus: health.status,
    lastSyncAt: health.lastSyncAt ?? persisted?.lastSyncAt ?? null,
    lastSuccessfulSyncAt: persisted?.lastSuccessfulSyncAt ?? null,
    permissions: permissionModel.declared,
    permissionsGranted: permissionModel.granted,
    dataCollected: dataModel.catalog,
    dataCollectionEnabled: dataModel.enabled,
    healthNote: health.note,
    lastSyncRun: lastSyncRun
      ? {
          id: lastSyncRun.id,
          status: lastSyncRun.status,
          finishedAt: lastSyncRun.finishedAt,
          fetched: lastSyncRun.fetched,
          mode: lastSyncRun.mode
        }
      : null
  };
}

export async function listSafeProviderStatuses(): Promise<SourceProviderStatus[]> {
  return Promise.all(listSourceProviders().map(provider => buildSafeProviderStatus(provider.id)));
}
