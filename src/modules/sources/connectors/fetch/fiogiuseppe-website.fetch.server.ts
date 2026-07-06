import {
  buildWebsiteContentHash,
  fetchConfigurableWebsite
} from '../website/configurable-website.fetch.server';
import { resolveFiogiuseppeWebsiteConfig } from '../website/website-connector.configs.server';

export type FiogiuseppeFetchResult = {
  items: import('../../platform/types').RawSyncItem[];
  errors: Array<{ code: string; message: string }>;
};

export type WebsitePageFields = {
  url: string;
  title: string;
  description: string;
  content: string;
  metadata: Record<string, unknown>;
  collectedAt: string;
  contentHash: string;
};

export { buildWebsiteContentHash };

export async function fetchFiogiuseppeWebsite(input: {
  since?: string | null;
  limit?: number;
}): Promise<FiogiuseppeFetchResult> {
  return fetchConfigurableWebsite(resolveFiogiuseppeWebsiteConfig(), input);
}

export { FIOGIUSEPPE_WEBSITE_FEED_URLS } from '../website/website-connector.configs.server';
