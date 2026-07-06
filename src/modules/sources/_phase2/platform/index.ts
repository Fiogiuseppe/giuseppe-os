export type {
  AuthStrategyKind,
  ConnectInput,
  ConnectResult,
  DisconnectResult,
  HealthResult,
  PermissionsResult,
  RefreshResult,
  SyncInput,
  SyncResult,
  SyncLogEntry,
  SyncMode,
  SyncRunStatus
} from './types';

export type { SourceAdapter } from './adapter.types';
export { SOURCES_PIPELINE_DESCRIPTION, SOURCES_PIPELINE_STAGES } from './pipeline-bridge.server';

export {
  applyPlatformAction,
  buildOAuthAuthorizeUrlAsync,
  completeOAuthConnect,
  connectSource,
  disconnectSource,
  listProviderStatuses,
  listSourceSyncRuns,
  refreshSource,
  syncSource
} from './platform.server';

export { getSourceAdapter, isOAuth2Source, listRegisteredAdapterIds } from './adapter-registry.server';
export { listSyncLogs } from './sync/sync-log.server';
