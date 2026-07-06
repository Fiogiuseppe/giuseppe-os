import type { SourceProviderId } from '../../providers/source-provider.types';

export type MediumConnectorConfig = {
  sourceId: SourceProviderId;
  connectorId: string;
  label: string;
  owner: string;
  sourceLabel: string;
  profileUrl: string;
  feedUrl: string;
  maxArticles: number;
};

export type MediumFetchInput = {
  since?: string | null;
  limit?: number;
};

export type MediumFetchResult = {
  items: import('../../platform/types').RawSyncItem[];
  errors: Array<{ code: string; message: string }>;
};

export const MEDIUM_DRAFTS_UNSUPPORTED_NOTE =
  'Drafts are unsupported. Only public RSS articles from Medium are synchronized.';
