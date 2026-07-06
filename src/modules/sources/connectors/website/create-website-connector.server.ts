import type { ConnectorSyncInput, ConnectorSyncResult, SourceConnector } from '../types';
import { fetchConfigurableWebsite } from './configurable-website.fetch.server';
import type { WebsiteConnectorConfig } from './website-connector.config.types';

export function createWebsiteConnector(config: WebsiteConnectorConfig): SourceConnector {
  const unavailableNote =
    config.configError ??
    'Website URL is not configured. Set the source environment variable to enable sync.';

  return {
    meta: {
      connectorId: config.connectorId,
      sourceId: config.sourceId,
      label: config.label,
      authStrategy: 'feed'
    },

    async connect() {
      if (!config.baseUrl) {
        return {
          ok: false,
          message: unavailableNote
        };
      }

      const feeds = [config.feedUrl, config.productsJsonUrl, config.sitemapUrl]
        .filter(Boolean)
        .join(', ');

      return {
        ok: true,
        message: `Monitoring enabled for ${config.baseUrl}${feeds ? ` via ${feeds}` : ''}.`
      };
    },

    async disconnect() {
      return;
    },

    async sync(input: ConnectorSyncInput): Promise<ConnectorSyncResult> {
      const fetched = await fetchConfigurableWebsite(config, {
        since: input.since ?? input.syncCursor,
        limit: config.maxPages
      });

      if (fetched.errors.length > 0 && fetched.items.length === 0) {
        return {
          status: 'failed',
          fetched: 0,
          normalized: 0,
          evidence: 0,
          errors: fetched.errors,
          message: fetched.errors[0]?.message ?? `${config.sourceLabel} fetch failed.`,
          rawItems: []
        };
      }

      const latestTimestamp = fetched.items
        .map(item => String(item.rawJson.publishedAt ?? ''))
        .filter(Boolean)
        .sort()
        .at(-1);

      return {
        status: fetched.errors.length > 0 ? 'partial' : 'success',
        fetched: fetched.items.length,
        normalized: 0,
        evidence: 0,
        errors: fetched.errors,
        message:
          fetched.items.length > 0
            ? `Fetched ${fetched.items.length} public items from ${config.sourceLabel}.`
            : 'No new public items since last sync.',
        nextSyncCursor: latestTimestamp ?? new Date().toISOString(),
        rawItems: fetched.items
      };
    },

    async health() {
      if (!config.baseUrl) {
        return {
          status: 'unavailable',
          note: unavailableNote
        };
      }

      const endpoints = [config.feedUrl, config.productsJsonUrl].filter(Boolean).join(' · ');
      return {
        status: 'healthy',
        note: endpoints ? `Public endpoints: ${endpoints}` : `Public site: ${config.baseUrl}`
      };
    }
  };
}
