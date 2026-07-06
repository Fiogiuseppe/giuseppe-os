import { GIUSEPPE_PRESENCE } from '../../../../lib/presence/canonical';
import { fetchFiogiuseppeWebsite } from './fetch/fiogiuseppe-website.fetch.server';
import type { SourceConnector } from './types';
import type { ConnectorSyncInput, ConnectorSyncResult } from './types';

const WEBSITE = GIUSEPPE_PRESENCE.channels.website;

/**
 * Phase 3 — fiogiuseppe.com real connector.
 * Fetches public RSS + profile metadata; stores raw rows (normalization in Phase 6).
 */
export const fiogiuseppeWebsiteConnector: SourceConnector = {
  meta: {
    connectorId: 'fiogiuseppe-website',
    sourceId: 'website',
    label: WEBSITE.label,
    authStrategy: 'feed'
  },

  async connect() {
    return {
      ok: true,
      message: `Monitoring enabled for ${WEBSITE.profileUrl} via public RSS.`
    };
  },

  async disconnect() {
    return;
  },

  async sync(input: ConnectorSyncInput): Promise<ConnectorSyncResult> {
    const fetched = await fetchFiogiuseppeWebsite({
      since: input.since ?? input.syncCursor,
      limit: 12
    });

    if (fetched.errors.length > 0 && fetched.items.length === 0) {
      return {
        status: 'failed',
        fetched: 0,
        normalized: 0,
        evidence: 0,
        errors: fetched.errors,
        message: fetched.errors[0]?.message ?? 'fiogiuseppe.com fetch failed.',
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
          ? `Fetched ${fetched.items.length} items from fiogiuseppe.com.`
          : 'No new items since last sync.',
      nextSyncCursor: latestTimestamp ?? new Date().toISOString(),
      rawItems: fetched.items
    };
  },

  async health() {
    return {
      status: 'healthy',
      note: `Feeds: ${WEBSITE.feedUrl}`
    };
  }
};

export { FIOGIUSEPPE_WEBSITE_FEED_URLS } from './fetch/fiogiuseppe-website.fetch.server';
