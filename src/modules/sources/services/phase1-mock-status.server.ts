import { listSourceProviders } from '../providers/source-registry';
import type { SourceProviderId, SourceProviderStatus } from '../providers/source-provider.types';

/** Phase 1 — static mock status. No persistence, OAuth, or external APIs. */
const MOCK_STATUS: Partial<
  Record<
    SourceProviderId,
    Pick<
      SourceProviderStatus,
      'connectionStatus' | 'healthStatus' | 'healthNote' | 'lastSyncAt' | 'lastSuccessfulSyncAt'
    >
  >
> = {
  instagram: {
    connectionStatus: 'needs_auth',
    healthStatus: 'unknown',
    healthNote: 'OAuth not configured — Phase 11.',
    lastSyncAt: null,
    lastSuccessfulSyncAt: null
  },
  linkedin: {
    connectionStatus: 'needs_auth',
    healthStatus: 'unknown',
    healthNote: 'OAuth not configured — Phase 12.',
    lastSyncAt: null,
    lastSuccessfulSyncAt: null
  },
  medium: {
    connectionStatus: 'disconnected',
    healthStatus: 'unknown',
    healthNote: 'Feed connector — Phase 5.',
    lastSyncAt: null,
    lastSuccessfulSyncAt: null
  },
  website: {
    connectionStatus: 'disconnected',
    healthStatus: 'unknown',
    healthNote: 'Public feeds at fiogiuseppe.com/feed/ — connect to sync.',
    lastSyncAt: null,
    lastSuccessfulSyncAt: null
  },
  'urees-instagram': {
    connectionStatus: 'needs_auth',
    healthStatus: 'unknown',
    healthNote: 'OAuth not configured — Phase 11.',
    lastSyncAt: null,
    lastSuccessfulSyncAt: null
  },
  'urees-website': {
    connectionStatus: 'disconnected',
    healthStatus: 'unavailable',
    healthNote: 'Set UREES_WEBSITE_URL in .env.local to enable UREES website sync.',
    lastSyncAt: null,
    lastSuccessfulSyncAt: null
  }
};

export function listPhase1MockStatuses(): SourceProviderStatus[] {
  return listSourceProviders().map(provider => {
    const mock = MOCK_STATUS[provider.id];

    return {
      id: provider.id,
      label: provider.label,
      description: provider.description,
      category: provider.category,
      group: provider.group,
      availability: 'active',
      authMethod: 'mock',
      connectionStatus: mock?.connectionStatus ?? 'disconnected',
      healthStatus: mock?.healthStatus ?? 'unknown',
      lastSyncAt: mock?.lastSyncAt ?? null,
      lastSuccessfulSyncAt: mock?.lastSuccessfulSyncAt ?? null,
      permissions: provider.permissions,
      permissionsGranted: [],
      dataCollected: provider.dataCollected,
      dataCollectionEnabled: [],
      healthNote: mock?.healthNote ?? null,
      lastSyncRun: null
    };
  });
}
