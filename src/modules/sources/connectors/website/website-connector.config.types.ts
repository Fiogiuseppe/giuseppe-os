import type { SourceProviderId } from '../../providers/source-provider.types';
import type { RawSyncItem } from '../../platform/types';

export type WebsiteConnectorConfig = {
  sourceId: SourceProviderId;
  connectorId: string;
  label: string;
  /** Raw item account key — e.g. fiogiuseppe, urees */
  owner: string;
  /** Human-readable source label stored on raw items */
  sourceLabel: string;
  displayName: string;
  baseUrl: string | null;
  feedUrl?: string | null;
  commentsFeedUrl?: string | null;
  sitemapUrl?: string | null;
  productsJsonUrl?: string | null;
  maxPages: number;
  maxComments?: number;
  handles?: string[];
  configError?: string;
  mockFixtures?: () => RawSyncItem[];
};

export type WebsiteFetchInput = {
  since?: string | null;
  limit?: number;
};

export type WebsiteFetchResult = {
  items: RawSyncItem[];
  errors: Array<{ code: string; message: string }>;
};
