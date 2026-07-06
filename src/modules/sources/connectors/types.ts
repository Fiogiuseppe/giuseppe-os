import type { SourceProviderId, HealthStatus } from '../providers/source-provider.types';
import type { AuthStrategyKind, SyncMode, SyncRunStatus } from '../platform/types';

export type SourceConnectorMeta = {
  connectorId: string;
  sourceId: SourceProviderId;
  label: string;
  authStrategy: AuthStrategyKind;
};

export type ConnectorSyncInput = {
  mode: SyncMode;
  since?: string | null;
  syncCursor?: string | null;
};

export type ConnectorSyncResult = {
  status: SyncRunStatus;
  fetched: number;
  normalized: number;
  evidence: number;
  errors: Array<{ code: string; message: string }>;
  message: string;
  nextSyncCursor?: string | null;
  rawItems?: import('../platform/types').RawSyncItem[];
};

export type ConnectorHealthResult = {
  status: HealthStatus;
  note: string | null;
};

export interface SourceConnector {
  readonly meta: SourceConnectorMeta;
  connect(): Promise<{ ok: true; message: string } | { ok: false; message: string }>;
  disconnect(): Promise<void>;
  sync(input: ConnectorSyncInput): Promise<ConnectorSyncResult>;
  health(): Promise<ConnectorHealthResult>;
}
