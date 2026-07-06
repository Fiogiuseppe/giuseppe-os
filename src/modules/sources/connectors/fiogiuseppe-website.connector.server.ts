import { GIUSEPPE_PRESENCE } from '../../../../lib/presence/canonical';
import { fetchFiogiuseppeWebsite } from './fetch/fiogiuseppe-website.fetch.server';
import type { ConnectorSyncInput, ConnectorSyncResult, SourceConnector } from './types';

const WEBSITE = GIUSEPPE_PRESENCE.channels.website;

/** Phase 3 — real public fiogiuseppe.com connector (RSS + profile metadata). */
export const fiogiuseppeWebsiteConnector: SourceConnector = {
  meta: {
    connectorId: 'website_personal',
    sourceId: 'website',
    label: WEBSITE.label,
    authStrategy: 'feed'
  },

  async connect() {
    return {
      ok: true,
      message: `Monitoring enabled for ${WEBSITE.profileUrl} via public feeds.`
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
          ? `Fetched ${fetched.items.length} public items from fiogiuseppe.com.`
          : 'No new public items since last sync.',
      nextSyncCursor: latestTimestamp ?? new Date().toISOString(),
      rawItems: fetched.items
    };
  },

  async health() {
    return {
      status: 'healthy',
      note: `Public feeds: ${WEBSITE.feedUrl}`
    };
  }
};

export { FIOGIUSEPPE_WEBSITE_FEED_URLS } from './fetch/fiogiuseppe-website.fetch.server';
