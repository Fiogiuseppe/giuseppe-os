import type { SelfModelDimensionKey } from '../self-model/types';

export const DATA_SOURCE_IDS = [
  'instagram',
  'linkedin',
  'calendar',
  'gmail',
  'github',
  'health',
  'books',
  'spotify',
  'figma',
  'website',
  'manual_import'
] as const;

export type DataSourceId = (typeof DATA_SOURCE_IDS)[number];

export type DataSourceAuthStatus = 'connected' | 'needs_auth' | 'error' | 'disabled';

export type DataSource = {
  id: string;
  source: DataSourceId;
  account: string;
  label: string;
  authStatus: DataSourceAuthStatus;
  readOnly: true;
  lastSyncAt: string | null;
  createdAt: string;
};

export type SourceMetrics = {
  likes?: number;
  comments?: number;
  shares?: number;
  impressions?: number;
  views?: number;
  saves?: number;
  [key: string]: number | undefined;
};

export type RawSourceItem = {
  id: string;
  source: DataSourceId;
  account: string;
  externalId: string;
  rawJson: Record<string, unknown>;
  fetchedAt: string;
  createdAt: string;
};

export type NormalizedSourceItemKind =
  | 'post'
  | 'comment'
  | 'story'
  | 'event'
  | 'email'
  | 'commit'
  | 'track'
  | 'design'
  | 'reading'
  | 'health_metric'
  | 'import'
  | 'unknown';

export type NormalizedSourceItem = {
  id: string;
  rawItemId: string;
  source: DataSourceId;
  account: string;
  externalId: string;
  content: string;
  caption: string | null;
  mediaUrls: string[];
  publishedAt: string;
  permalink: string;
  metrics: SourceMetrics | null;
  kind: NormalizedSourceItemKind;
  createdAt: string;
};

export type EvidenceConfidence = 'low' | 'medium' | 'high';

export type EvidenceItem = {
  id: string;
  normalizedItemId: string;
  source: DataSourceId;
  account: string;
  attribution: string;
  summary: string;
  dimensionHints: SelfModelDimensionKey[];
  confidence: EvidenceConfidence;
  traceId: string;
  publishedAt: string;
  permalink: string;
  createdAt: string;
};

export type SourceConnectorCapability = {
  canReadPosts: boolean;
  canReadComments: boolean;
  canReadMetrics: boolean;
};

export type SourceConnectorMeta = {
  source: DataSourceId;
  label: string;
  readOnly: true;
  requiredEnvVars: string[];
  capabilities: SourceConnectorCapability;
};

export type SourceFetchContext = {
  account: string;
  since?: string;
  limit?: number;
  manualPayload?: Array<{
    externalId: string;
    rawJson: Record<string, unknown>;
  }>;
};

export type SourceConnectorErrorCode =
  | 'needs_auth'
  | 'missing_permissions'
  | 'not_configured'
  | 'upstream_error';

export type SourceConnectorFetchSuccess = {
  ok: true;
  items: Array<{
    source: DataSourceId;
    account: string;
    externalId: string;
    rawJson: Record<string, unknown>;
  }>;
};

export type SourceConnectorFetchFailure = {
  ok: false;
  code: SourceConnectorErrorCode;
  message: string;
};

export type SourceConnectorFetchResult = SourceConnectorFetchSuccess | SourceConnectorFetchFailure;

export interface SourceConnector {
  meta: SourceConnectorMeta;
  isConfigured(): boolean;
  fetch(context: SourceFetchContext): Promise<SourceConnectorFetchResult>;
}

export type SourceIngestionError = {
  code: string;
  message: string;
};

export type SourceIngestionResult = {
  source: DataSourceId;
  account: string;
  fetched: number;
  normalized: number;
  evidence: number;
  skipped: number;
  errors: SourceIngestionError[];
};

export type DataSourcePipelineStage =
  | 'source'
  | 'normalize'
  | 'analyze'
  | 'evidence'
  | 'self_model';
