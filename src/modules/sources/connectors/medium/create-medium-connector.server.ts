import type { ConnectorSyncInput, ConnectorSyncResult, SourceConnector } from '../types';
import {
  MEDIUM_DRAFTS_UNSUPPORTED_NOTE,
  type MediumConnectorConfig
} from './medium-connector.config.types';
import { fetchMediumFeed } from './medium-feed.fetch.server';

export function createMediumConnector(config: MediumConnectorConfig): SourceConnector {
  return {
    meta: {
      connectorId: config.connectorId,
      sourceId: config.sourceId,
      label: config.label,
      authStrategy: 'feed'
    },

    async connect() {
      return {
        ok: true,
        message: `Monitoring enabled for ${config.profileUrl} via public RSS. ${MEDIUM_DRAFTS_UNSUPPORTED_NOTE}`
      };
    },

    async disconnect() {
      return;
    },

    async sync(input: ConnectorSyncInput): Promise<ConnectorSyncResult> {
      const fetched = await fetchMediumFeed(config, {
        since: input.since ?? input.syncCursor,
        limit: config.maxArticles
      });

      if (fetched.errors.length > 0 && fetched.items.length === 0) {
        return {
          status: 'failed',
          fetched: 0,
          normalized: 0,
          evidence: 0,
          errors: fetched.errors,
          message: fetched.errors[0]?.message ?? 'Medium RSS fetch failed.',
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
            ? `Fetched ${fetched.items.length} public Medium articles from RSS. ${MEDIUM_DRAFTS_UNSUPPORTED_NOTE}`
            : 'No new public Medium articles since last sync.',
        nextSyncCursor: latestTimestamp ?? new Date().toISOString(),
        rawItems: fetched.items
      };
    },

    async health() {
      return {
        status: 'healthy',
        note: `Public RSS: ${config.feedUrl}. ${MEDIUM_DRAFTS_UNSUPPORTED_NOTE}`
      };
    }
  };
}
