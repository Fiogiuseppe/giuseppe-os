import { fetchText } from '../../../../../lib/presence/http';
import { parseRssChannelDescription, parseRssItems } from '../../../../../lib/presence/parseRss';
import { buildWebsiteContentHash } from '../website/configurable-website.fetch.server';
import type { RawSyncItem } from '../../platform/types';
import type {
  MediumConnectorConfig,
  MediumFetchInput,
  MediumFetchResult
} from './medium-connector.config.types';

const FETCH_TIMEOUT_MS = 15_000;

function isMockFetchEnabled(): boolean {
  return process.env.SOURCES_MEDIUM_MOCK_FETCH === '1' || process.env.ALLOW_TEST_ROUTES === '1';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAfterCursor(publishedAt: string, since: string | null | undefined): boolean {
  if (!since) {
    return true;
  }

  const published = new Date(publishedAt).getTime();
  const cursor = new Date(since).getTime();
  if (Number.isNaN(published) || Number.isNaN(cursor)) {
    return true;
  }

  return published > cursor;
}

function buildMediumItem(
  config: MediumConnectorConfig,
  externalId: string,
  fields: {
    kind: string;
    url: string;
    title: string;
    subtitle: string;
    description: string;
    content: string;
    publishedAt: string;
    tags: string[];
    metadata: Record<string, unknown>;
    collectedAt: string;
  }
): RawSyncItem {
  const contentHash = buildWebsiteContentHash(fields.url, fields.content);

  return {
    account: config.owner,
    externalId,
    rawJson: {
      kind: fields.kind,
      source: config.sourceLabel,
      url: fields.url,
      title: fields.title,
      subtitle: fields.subtitle,
      description: fields.description,
      content: fields.content,
      summary: fields.description,
      publishedAt: fields.publishedAt,
      tags: fields.tags,
      metadata: fields.metadata,
      collectedAt: fields.collectedAt,
      contentHash
    }
  };
}

function mockFetchResult(config: MediumConnectorConfig): MediumFetchResult {
  const collectedAt = new Date().toISOString();
  const base = config.profileUrl.endsWith('/') ? config.profileUrl : `${config.profileUrl}/`;

  return {
    items: [
      buildMediumItem(config, `${config.sourceId}:profile`, {
        kind: 'profile',
        url: base,
        title: 'Giuseppe Fioretti on Medium',
        subtitle: 'Public articles by Giuseppe Fioretti',
        description: 'Long-form writing on design, decision intelligence, and creative direction.',
        content: 'Giuseppe Fioretti writes about decision intelligence, branding, and creative direction.',
        publishedAt: collectedAt,
        tags: ['design', 'decision intelligence'],
        metadata: {
          feedUrl: config.feedUrl,
          draftsSupported: false
        },
        collectedAt
      }),
      buildMediumItem(config, `${config.sourceId}:article:decision-intelligence`, {
        kind: 'article',
        url: `${base}decision-intelligence-for-creative-leaders-mock`,
        title: 'Decision Intelligence for Creative Leaders',
        subtitle: 'How better decisions shape long-term creative work.',
        description:
          'Decision intelligence helps creative leaders choose projects, themes, and trajectories with evidence.',
        content:
          'Decision intelligence helps creative leaders choose projects, themes, and trajectories with evidence. Topics include branding, creative direction, and long-term trajectory.',
        publishedAt: collectedAt,
        tags: ['Decision Intelligence', 'Creative Direction', 'Branding'],
        metadata: {
          creator: 'Giuseppe Fioretti',
          feed: 'medium-rss',
          draftsSupported: false
        },
        collectedAt
      }),
      buildMediumItem(config, `${config.sourceId}:article:visceral-poems`, {
        kind: 'article',
        url: `${base}visceral-poems-and-art-mock`,
        title: 'Visceral Poems and the Language of Art',
        subtitle: 'Poetry, painting, and projects that stay close to the body.',
        description: 'An essay on Visceral Poems, art, and the discipline of making.',
        content:
          'Visceral Poems explores art, poems, and painting as one continuous project. The essay discusses themes of embodiment and creative practice.',
        publishedAt: collectedAt,
        tags: ['Art', 'Poems', 'Projects'],
        metadata: {
          creator: 'Giuseppe Fioretti',
          feed: 'medium-rss',
          draftsSupported: false
        },
        collectedAt
      })
    ],
    errors: []
  };
}

/** Public Medium RSS fetch — no OAuth, no drafts. */
export async function fetchMediumFeed(
  config: MediumConnectorConfig,
  input: MediumFetchInput = {}
): Promise<MediumFetchResult> {
  if (isMockFetchEnabled()) {
    return mockFetchResult(config);
  }

  const limit = Math.min(input.limit ?? config.maxArticles, config.maxArticles);
  const items: RawSyncItem[] = [];
  const errors: Array<{ code: string; message: string }> = [];
  const collectedAt = new Date().toISOString();

  try {
    const feedXml = await fetchText(config.feedUrl, FETCH_TIMEOUT_MS);
    const channelDescription = parseRssChannelDescription(feedXml);

    items.push(
      buildMediumItem(config, `${config.sourceId}:profile`, {
        kind: 'profile',
        url: config.profileUrl,
        title: config.label,
        subtitle: channelDescription.slice(0, 180),
        description: channelDescription,
        content: stripHtml(channelDescription) || config.label,
        publishedAt: collectedAt,
        tags: [],
        metadata: {
          feedUrl: config.feedUrl,
          draftsSupported: false
        },
        collectedAt
      })
    );

    for (const entry of parseRssItems(feedXml, limit)) {
      if (!isAfterCursor(entry.pubDate, input.since)) {
        continue;
      }

      const description = entry.description.slice(0, 500);
      const content = stripHtml(entry.description) || entry.title;
      const subtitle = description.split('.').at(0)?.slice(0, 180) ?? '';

      items.push(
        buildMediumItem(config, `${config.sourceId}:article:${entry.guid}`, {
          kind: 'article',
          url: entry.link,
          title: entry.title,
          subtitle,
          description,
          content: content || entry.title,
          publishedAt: new Date(entry.pubDate).toISOString(),
          tags: entry.categories,
          metadata: {
            creator: entry.creator ?? 'Giuseppe Fioretti',
            feed: 'medium-rss',
            guid: entry.guid,
            draftsSupported: false
          },
          collectedAt
        })
      );
    }
  } catch (error) {
    errors.push({
      code: 'upstream_error',
      message: error instanceof Error ? error.message : 'Medium RSS fetch failed.'
    });
  }

  return { items, errors };
}
