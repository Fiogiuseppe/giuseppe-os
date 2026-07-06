import { listSourceConfigs } from '../config/source-config';
import { listSourceProviders } from '../providers/source-registry';
import type { SourceProviderId, SourceProviderStatus } from '../providers/source-provider.types';

/** Phase 1 — static mock status. No persistence, OAuth, or external APIs. */
export function listPhase1MockStatuses(): SourceProviderStatus[] {
  const seededNotes = Object.fromEntries(
    listSourceConfigs()
      .filter(config => config.seededHealthNote)
      .map(config => [config.id, config.seededHealthNote])
  ) as Partial<Record<SourceProviderId, string>>;

  return listSourceProviders().map(provider => {
    const seededNote = seededNotes[provider.id];

    return {
      id: provider.id,
      label: provider.label,
      description: provider.description,
      category: provider.category,
      group: provider.group,
      availability: 'active',
      authMethod: provider.authMethod === 'oauth' ? 'oauth' : provider.authMethod === 'feed' ? 'feed' : 'mock',
      connectionStatus: provider.authMethod === 'oauth' ? 'needs_auth' : 'disconnected',
      healthStatus: 'unknown',
      healthNote: seededNote ?? null,
      lastSyncAt: null,
      lastSuccessfulSyncAt: null,
      permissions: provider.permissions,
      permissionsGranted: [],
      dataCollected: provider.dataCollected,
      dataCollectionEnabled: [],
      lastSyncRun: null
    };
  });
}
