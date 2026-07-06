import type { SourceProviderId } from '../providers/source-provider.types';

/** Authentication strategies supported by the Sources Platform. */
export type AuthStrategyKind =
  | 'oauth2'
  | 'api_key'
  | 'file_import'
  | 'feed'
  | 'webhook'
  | 'custom'
  | 'none';

export type PlatformConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'needs_auth'
  | 'error';

export type PlatformHealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export type SyncMode = 'manual' | 'scheduled' | 'incremental';

export type SyncRunStatus = 'success' | 'partial' | 'failed' | 'skipped';

/** Server-only credential bundle — never expose to the browser. */
export type OAuth2Credentials = {
  kind: 'oauth2';
  accessToken: string;
  tokenType: string;
  scope: string;
  refreshToken?: string;
  expiresAt?: string;
};

export type ApiKeyCredentials = {
  kind: 'api_key';
  apiKey: string;
  label?: string;
};

export type WebhookCredentials = {
  kind: 'webhook';
  signingSecret: string;
};

export type StoredCredentials = OAuth2Credentials | ApiKeyCredentials | WebhookCredentials;

export type ConnectInput = {
  sourceId: SourceProviderId;
  /** OAuth authorization code — server-side exchange only. */
  authorizationCode?: string;
  redirectUri?: string;
  oauthState?: string;
};

export type ConnectResult =
  | { outcome: 'active'; message: string }
  | { outcome: 'redirect'; authorizeUrl: string }
  | { outcome: 'pending'; message: string };

export type DisconnectResult = {
  disconnected: true;
  message: string;
};

export type SyncInput = {
  sourceId: SourceProviderId;
  mode?: SyncMode;
  since?: string;
  limit?: number;
  /** Test-only: force sync failure when ALLOW_TEST_ROUTES=1 */
  simulateFailure?: boolean;
};

export type SyncResult = {
  sourceId: SourceProviderId;
  status: SyncRunStatus;
  mode: SyncMode;
  fetched: number;
  normalized: number;
  evidence: number;
  lastSyncAt: string;
  errors: Array<{ code: string; message: string }>;
  rawItems?: RawSyncItem[];
  rawSaved?: number;
};

export type RefreshResult = {
  sourceId: SourceProviderId;
  refreshed: boolean;
  message: string;
};

export type HealthResult = {
  sourceId: SourceProviderId;
  status: PlatformHealthStatus;
  connectionStatus: PlatformConnectionStatus;
  note: string | null;
  lastSyncAt: string | null;
};

export type PermissionsResult = {
  sourceId: SourceProviderId;
  declared: string[];
  granted: string[];
};

export type SyncLogEntry = {
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

export type RawSyncItem = {
  externalId: string;
  rawJson: Record<string, unknown>;
  account: string;
};
