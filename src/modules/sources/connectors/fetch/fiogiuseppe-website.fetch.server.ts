import { createHash } from 'node:crypto';
import { GIUSEPPE_PRESENCE } from '../../../../../lib/presence/canonical';
import { fetchText } from '../../../../../lib/presence/http';
import { parseRssChannelDescription, parseRssItems } from '../../../../../lib/presence/parseRss';
import type { RawSyncItem } from '../../platform/types';

const WEBSITE = GIUSEPPE_PRESENCE.channels.website;
const ACCOUNT = 'fiogiuseppe';
const MAX_POSTS = 12;
const MAX_COMMENTS = 10;
const FETCH_TIMEOUT_MS = 15_000;

export type FiogiuseppeFetchResult = {
  items: RawSyncItem[];
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

function isMockFetchEnabled(): boolean {
  return process.env.SOURCES_WEBSITE_MOCK_FETCH === '1' || process.env.ALLOW_TEST_ROUTES === '1';
}

export function buildWebsiteContentHash(url: string, content: string): string {
  return createHash('sha256').update(`${url}:${content}`).digest('hex');
}

function buildWebsiteItem(
  externalId: string,
  fields: Omit<WebsitePageFields, 'contentHash'> & { kind: string; publishedAt?: string }
): RawSyncItem {
  const contentHash = buildWebsiteContentHash(fields.url, fields.content);

  return {
    account: ACCOUNT,
    externalId,
    rawJson: {
      kind: fields.kind,
      source: 'fiogiuseppe.com',
      url: fields.url,
      title: fields.title,
      description: fields.description,
      content: fields.content,
      summary: fields.description,
      metadata: fields.metadata,
      collectedAt: fields.collectedAt,
      contentHash,
      publishedAt: fields.publishedAt ?? fields.collectedAt
    }
  };
}

function mockFetchResult(): FiogiuseppeFetchResult {
  const collectedAt = new Date().toISOString();
  const postUrl = `${WEBSITE.profileUrl}mock-project/`;

  return {
    items: [
      buildWebsiteItem('website:profile', {
        kind: 'profile',
        url: WEBSITE.profileUrl,
        title: GIUSEPPE_PRESENCE.displayName,
        description: 'Personal site and projects.',
        content: 'Giuseppe Fioretti — designer, builder, decision intelligence.',
        metadata: { handles: GIUSEPPE_PRESENCE.handles, feedUrl: WEBSITE.feedUrl },
        collectedAt,
        publishedAt: collectedAt
      }),
      buildWebsiteItem('website:post:mock-project', {
        kind: 'post',
        url: postUrl,
        title: 'Visceral Poems — studio update',
        description: 'Visceral Poems explores painting, art, and creative direction.',
        content:
          'Visceral Poems is an ongoing project. UREES branding and brand identity work continues alongside painting and poems.',
        metadata: { categories: ['projects', 'art'], feed: 'posts' },
        collectedAt,
        publishedAt: collectedAt
      }),
      buildWebsiteItem('website:comment:mock-1', {
        kind: 'comment',
        url: WEBSITE.profileUrl,
        title: 'Visitor note',
        description: 'Mock comment fixture.',
        content: 'Mock comment fixture.',
        metadata: { author: 'Visitor', feed: 'comments' },
        collectedAt,
        publishedAt: collectedAt
      })
    ],
    errors: []
  };
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

function readMetaContent(html: string, property: string): string {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i')
  );
  return match?.[1]?.trim() ?? '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchFiogiuseppeWebsite(input: {
  since?: string | null;
  limit?: number;
}): Promise<FiogiuseppeFetchResult> {
  if (isMockFetchEnabled()) {
    return mockFetchResult();
  }

  const limit = Math.min(input.limit ?? MAX_POSTS, MAX_POSTS);
  const items: RawSyncItem[] = [];
  const errors: Array<{ code: string; message: string }> = [];
  const collectedAt = new Date().toISOString();

  try {
    const [homeHtml, feedXml, commentsXml] = await Promise.all([
      fetchText(WEBSITE.profileUrl, FETCH_TIMEOUT_MS),
      fetchText(WEBSITE.feedUrl, FETCH_TIMEOUT_MS),
      fetchText(WEBSITE.commentsFeedUrl, FETCH_TIMEOUT_MS).catch(() => '')
    ]);

    const profileDescription =
      readMetaContent(homeHtml, 'description') || parseRssChannelDescription(feedXml);
    const profileTitle =
      readMetaContent(homeHtml, 'og:title') || GIUSEPPE_PRESENCE.displayName;

    items.push(
      buildWebsiteItem('website:profile', {
        kind: 'profile',
        url: WEBSITE.profileUrl,
        title: profileTitle,
        description: profileDescription,
        content: stripHtml(profileDescription) || profileTitle,
        metadata: {
          handles: GIUSEPPE_PRESENCE.handles,
          feedUrl: WEBSITE.feedUrl,
          commentsFeedUrl: WEBSITE.commentsFeedUrl
        },
        collectedAt,
        publishedAt: collectedAt
      })
    );

    for (const entry of parseRssItems(feedXml, limit)) {
      if (!isAfterCursor(entry.pubDate, input.since)) {
        continue;
      }

      const description = entry.description.slice(0, 500);
      const content = stripHtml(entry.description);

      items.push(
        buildWebsiteItem(`website:post:${entry.guid}`, {
          kind: 'post',
          url: entry.link,
          title: entry.title,
          description,
          content: content || entry.title,
          metadata: {
            categories: entry.categories,
            feed: 'posts',
            guid: entry.guid
          },
          collectedAt,
          publishedAt: new Date(entry.pubDate).toISOString()
        })
      );
    }

    if (commentsXml) {
      for (const entry of parseRssItems(commentsXml, MAX_COMMENTS)) {
        if (!isAfterCursor(entry.pubDate, input.since)) {
          continue;
        }

        const description = entry.description.slice(0, 500);
        const content = stripHtml(entry.description);

        items.push(
          buildWebsiteItem(`website:comment:${entry.guid}`, {
            kind: 'comment',
            url: entry.link,
            title: entry.title || 'Comment',
            description,
            content: content || entry.title || 'Comment',
            metadata: {
              author: entry.creator || 'Visitor',
              feed: 'comments',
              guid: entry.guid
            },
            collectedAt,
            publishedAt: new Date(entry.pubDate).toISOString()
          })
        );
      }
    }
  } catch (error) {
    errors.push({
      code: 'upstream_error',
      message: error instanceof Error ? error.message : 'fiogiuseppe.com fetch failed.'
    });
  }

  return { items, errors };
}

export const FIOGIUSEPPE_WEBSITE_FEED_URLS = {
  posts: WEBSITE.feedUrl,
  comments: WEBSITE.commentsFeedUrl,
  profile: WEBSITE.profileUrl
} as const;
