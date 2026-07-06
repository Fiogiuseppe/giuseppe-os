/**
 * Safe, frontend-visible types only.
 * Never include access tokens, refresh tokens, client secrets, or API keys here.
 *
 * Phase 2: six sources only (Personal + UREES).
 */

export const SOURCE_PROVIDER_IDS = [
  'instagram',
  'linkedin',
  'medium',
  'website',
  'urees-instagram',
  'urees-website'
] as const;

export type SourceProviderId = (typeof SOURCE_PROVIDER_IDS)[number];

export type ConnectionStatus = 'connected' | 'disconnected' | 'needs_auth' | 'error';

export type HealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export type SyncRunStatus = 'success' | 'partial' | 'failed' | 'skipped';

export type SyncMode = 'manual' | 'scheduled' | 'incremental';

/** Phase 2: all six sources are active. Later phases add future availability. */
export type SourceAvailability = 'active' | 'future';

export type SourceProviderCategory = 'social';

export type SourceProviderGroupId = 'personal' | 'urees';

export type SourceAuthMethod = 'oauth' | 'feed' | 'stub';

/** Static provider contract — metadata only, no secrets. */
export type SourceProvider = {
  id: SourceProviderId;
  label: string;
  description: string;
  category: SourceProviderCategory;
  group: SourceProviderGroupId;
  authMethod: SourceAuthMethod;
  permissions: string[];
  dataCollected: string[];
  profileUrl?: string;
};

export type SourceSyncRunSummary = {
  id: string;
  status: SyncRunStatus;
  finishedAt: string;
  fetched: number;
  mode: SyncMode;
};

/** Runtime status returned to the UI — safe metadata only. */
export type SourceProviderStatus = {
  id: SourceProviderId;
  label: string;
  description: string;
  category: SourceProviderCategory;
  group: SourceProviderGroupId;
  availability: SourceAvailability;
  /** Connector type — never includes secrets. */
  authMethod: 'oauth' | 'feed' | 'mock';
  connectionStatus: ConnectionStatus;
  healthStatus: HealthStatus;
  lastSyncAt: string | null;
  lastSuccessfulSyncAt: string | null;
  permissions: string[];
  permissionsGranted: string[];
  dataCollected: string[];
  dataCollectionEnabled: string[];
  healthNote: string | null;
  lastSyncRun: SourceSyncRunSummary | null;
};

export type SourceAction = 'connect' | 'disconnect' | 'sync';

export type SourceActionRequest = {
  sourceId: SourceProviderId;
  action: SourceAction;
};

export type SourcesListResponse = {
  sources: SourceProviderStatus[];
  updatedAt: string;
};

export type SourceActionResponse = {
  source: SourceProviderStatus;
  message: string;
};
