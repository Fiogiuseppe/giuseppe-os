import type { SourceProviderId } from '../../providers/source-provider.types';
import type { ConnectionStatus, HealthStatus } from '../../providers/source-provider.types';
import type { SyncMode, SyncRunStatus } from '../types';

export type SourceEngineStoreBackend = 'supabase' | 'file' | 'memory';

export type PersistedConnectionRecord = {
  sourceId: SourceProviderId;
  connectionStatus: ConnectionStatus;
  healthStatus: HealthStatus;
  lastSyncAt: string | null;
  permissionsGranted: string[];
  dataCollectionEnabled: string[];
  healthNote: string | null;
  syncCursor: string | null;
  connectedAt: string | null;
  updatedAt: string;
};

export type PersistedSyncRunRecord = {
  id: string;
  sourceId: SourceProviderId;
  mode: SyncMode;
  status: SyncRunStatus;
  startedAt: string;
  finishedAt: string;
  fetched: number;
  normalized: number;
  evidence: number;
  errorMessage: string | null;
};

export type UpsertConnectionInput = Omit<PersistedConnectionRecord, 'updatedAt'> & {
  updatedAt?: string;
};

export interface SourceEngineStore {
  backend: SourceEngineStoreBackend;
  getConnection(sourceId: SourceProviderId): Promise<PersistedConnectionRecord | null>;
  listConnections(): Promise<PersistedConnectionRecord[]>;
  upsertConnection(input: UpsertConnectionInput): Promise<PersistedConnectionRecord>;
  deleteConnection(sourceId: SourceProviderId): Promise<void>;
  appendSyncRun(input: Omit<PersistedSyncRunRecord, 'id'> & { id?: string }): Promise<PersistedSyncRunRecord>;
  listSyncRuns(sourceId: SourceProviderId, limit?: number): Promise<PersistedSyncRunRecord[]>;
  resetForTests(): Promise<void>;
}
