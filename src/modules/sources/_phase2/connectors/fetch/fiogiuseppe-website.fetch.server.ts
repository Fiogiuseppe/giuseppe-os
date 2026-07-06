import { GIUSEPPE_PRESENCE } from '../../../../../lib/presence/canonical';
import { fetchText } from '../../../../../lib/presence/http';
import { parseRssChannelDescription, parseRssItems } from '../../../../../lib/presence/parseRss';
import type { RawSyncItem } from '../../platform/types';

const WEBSITE = GIUSEPPE_PRESENCE.channels.website;
const ACCOUNT = 'fiogiuseppe';

export type FiogiuseppeFetchResult = {
  items: RawSyncItem[];
  errors: Array<{ code: string; message: string }>;
};

function isMockFetchEnabled(): boolean {
  return process.env.SOURCES_WEBSITE_MOCK_FETCH === '1' || process.env.ALLOW_TEST_ROUTES === '1';
}

function mockFetchResult(): FiogiuseppeFetchResult {
  const now = new Date().toISOString();
  return {
    items: [
      {
        account: ACCOUNT,
        externalId: 'website:mock-post-1',
        rawJson: {
          kind: 'post',
          source: 'fiogiuseppe.com',
          title: 'Mock project update',
          summary: 'Phase 3 test fixture — not live site data.',
          url: `${WEBSITE.profileUrl}mock-project/`,
          publishedAt: now,
          categories: ['projects']
        }
      },
      {
        account: ACCOUNT,
        externalId: 'website:mock-comment-1',
        rawJson: {
          kind: 'comment',
          source: 'fiogiuseppe.com',
          title: 'Visitor note',
          summary: 'Mock comment fixture.',
          url: WEBSITE.profileUrl,
          publishedAt: now,
          author: 'Visitor'
        }
      }
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

export async function fetchFiogiuseppeWebsite(input: {
  since?: string | null;
  limit?: number;
}): Promise<FiogiuseppeFetchResult> {
  if (isMockFetchEnabled()) {
    return mockFetchResult();
  }

  const limit = input.limit ?? 12;
  const items: RawSyncItem[] = [];
  const errors: Array<{ code: string; message: string }> = [];

  try {
    const [homeHtml, feedXml, commentsXml] = await Promise.all([
      fetchText(WEBSITE.profileUrl),
      fetchText(WEBSITE.feedUrl),
      fetchText(WEBSITE.commentsFeedUrl).catch(() => '')
    ]);

    const profileSummary =
      readMetaContent(homeHtml, 'description') || parseRssChannelDescription(feedXml);

    items.push({
      account: ACCOUNT,
      externalId: 'website:profile',
      rawJson: {
        kind: 'profile',
        source: 'fiogiuseppe.com',
        title: GIUSEPPE_PRESENCE.displayName,
        summary: profileSummary,
        url: WEBSITE.profileUrl,
        publishedAt: new Date().toISOString(),
        handles: GIUSEPPE_PRESENCE.handles
      }
    });

    for (const entry of parseRssItems(feedXml, limit)) {
      if (!isAfterCursor(entry.pubDate, input.since)) {
        continue;
      }

      items.push({
        account: ACCOUNT,
        externalId: `website:post:${entry.guid}`,
        rawJson: {
          kind: 'post',
          source: 'fiogiuseppe.com',
          title: entry.title,
          summary: entry.description.slice(0, 500),
          url: entry.link,
          publishedAt: new Date(entry.pubDate).toISOString(),
          categories: entry.categories
        }
      });
    }

    if (commentsXml) {
      for (const entry of parseRssItems(commentsXml, 10)) {
        if (!isAfterCursor(entry.pubDate, input.since)) {
          continue;
        }

        items.push({
          account: ACCOUNT,
          externalId: `website:comment:${entry.guid}`,
          rawJson: {
            kind: 'comment',
            source: 'fiogiuseppe.com',
            title: entry.title || 'Comment',
            summary: entry.description.slice(0, 500),
            url: entry.link,
            publishedAt: new Date(entry.pubDate).toISOString(),
            author: entry.creator || 'Visitor'
          }
        });
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
