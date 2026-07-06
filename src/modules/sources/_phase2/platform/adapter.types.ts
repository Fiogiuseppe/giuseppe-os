import type { SourceProviderId } from '../providers/source-provider.types';
import type {
  AuthStrategyKind,
  ConnectInput,
  ConnectResult,
  DisconnectResult,
  HealthResult,
  PermissionsResult,
  RawSyncItem,
  RefreshResult,
  SyncInput,
  SyncResult
} from './types';

/**
 * Universal provider adapter contract.
 * The UI and API routes talk only to the platform — never to provider specifics.
 */
export interface SourceAdapter {
  readonly sourceId: SourceProviderId;
  readonly authStrategy: AuthStrategyKind;

  connect(input: ConnectInput): Promise<ConnectResult>;
  disconnect(): Promise<DisconnectResult>;
  sync(input: SyncInput): Promise<SyncResult>;
  refresh(): Promise<RefreshResult>;
  health(): Promise<HealthResult>;
  permissions(): Promise<PermissionsResult>;

  /** Optional pull hook used by the sync engine before pipeline ingestion. */
  fetchRawItems?(input: SyncInput): Promise<RawSyncItem[]>;
}

export type AdapterFactory = () => SourceAdapter;
