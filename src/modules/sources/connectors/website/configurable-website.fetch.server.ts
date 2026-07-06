import { createHash } from 'node:crypto';
import { fetchText } from '../../../../../lib/presence/http';
import { parseRssChannelDescription, parseRssItems } from '../../../../../lib/presence/parseRss';
import type { RawSyncItem } from '../../platform/types';
import type {
  WebsiteConnectorConfig,
  WebsiteFetchInput,
  WebsiteFetchResult
} from './website-connector.config.types';

const FETCH_TIMEOUT_MS = 15_000;

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

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function buildWebsiteItem(
  config: WebsiteConnectorConfig,
  externalId: string,
  fields: Omit<WebsitePageFields, 'contentHash'> & { kind: string; publishedAt?: string }
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

function parseSitemapUrls(xml: string, limit: number): string[] {
  const urls: string[] = [];
  const pattern = /<loc>([^<]+)<\/loc>/gi;
  let match = pattern.exec(xml);

  while (match && urls.length < limit) {
    const url = match[1]?.trim();
    if (url) {
      urls.push(url);
    }
    match = pattern.exec(xml);
  }

  return urls;
}

type ShopifyProduct = {
  id?: number;
  title?: string;
  handle?: string;
  body_html?: string;
  created_at?: string;
  updated_at?: string;
  product_type?: string;
  tags?: string;
};

function parseShopifyProducts(jsonText: string, baseUrl: string, limit: number): ShopifyProduct[] {
  const parsed = JSON.parse(jsonText) as { products?: ShopifyProduct[] };
  return (parsed.products ?? []).slice(0, limit);
}

async function fetchSitemapPages(
  config: WebsiteConnectorConfig,
  collectedAt: string,
  since: string | null | undefined,
  limit: number
): Promise<RawSyncItem[]> {
  if (!config.sitemapUrl) {
    return [];
  }

  const items: RawSyncItem[] = [];
  const sitemapXml = await fetchText(config.sitemapUrl, FETCH_TIMEOUT_MS);
  const urls = parseSitemapUrls(sitemapXml, limit);

  for (const url of urls) {
    if (url === config.baseUrl || url === normalizeBaseUrl(config.baseUrl ?? '')) {
      continue;
    }

    try {
      const html = await fetchText(url, FETCH_TIMEOUT_MS);
      const title = readMetaContent(html, 'og:title') || readMetaContent(html, 'title') || url;
      const description = readMetaContent(html, 'description') || readMetaContent(html, 'og:description');
      const content = stripHtml(description) || title;
      const publishedAt = collectedAt;

      if (!isAfterCursor(publishedAt, since)) {
        continue;
      }

      items.push(
        buildWebsiteItem(config, `${config.sourceId}:sitemap:${url}`, {
          kind: 'page',
          url,
          title,
          description,
          content,
          metadata: { source: 'sitemap' },
          collectedAt,
          publishedAt
        })
      );
    } catch {
      // Skip individual sitemap page failures.
    }
  }

  return items;
}

/** Shared public website fetch — RSS, profile, products JSON, optional sitemap. */
export async function fetchConfigurableWebsite(
  config: WebsiteConnectorConfig,
  input: WebsiteFetchInput = {}
): Promise<WebsiteFetchResult> {
  if (isMockFetchEnabled() && config.mockFixtures) {
    return { items: config.mockFixtures(), errors: [] };
  }

  if (!config.baseUrl) {
    return {
      items: [],
      errors: [
        {
          code: 'config_missing',
          message:
            config.configError ??
            'Website URL is not configured. Set the source environment variable to enable sync.'
        }
      ]
    };
  }

  const limit = Math.min(input.limit ?? config.maxPages, config.maxPages);
  const maxComments = config.maxComments ?? 10;
  const items: RawSyncItem[] = [];
  const errors: Array<{ code: string; message: string }> = [];
  const collectedAt = new Date().toISOString();
  const baseUrl = normalizeBaseUrl(config.baseUrl);

  try {
    const fetchTasks: Promise<void>[] = [];

    fetchTasks.push(
      (async () => {
        const homeHtml = await fetchText(baseUrl, FETCH_TIMEOUT_MS);
        const profileTitle = readMetaContent(homeHtml, 'og:title') || config.displayName;
        const profileDescription =
          readMetaContent(homeHtml, 'description') || readMetaContent(homeHtml, 'og:description');

        items.push(
          buildWebsiteItem(config, `${config.sourceId}:profile`, {
            kind: 'profile',
            url: baseUrl,
            title: profileTitle,
            description: profileDescription,
            content: stripHtml(profileDescription) || profileTitle,
            metadata: {
              handles: config.handles ?? [],
              feedUrl: config.feedUrl ?? null,
              commentsFeedUrl: config.commentsFeedUrl ?? null,
              productsJsonUrl: config.productsJsonUrl ?? null
            },
            collectedAt,
            publishedAt: collectedAt
          })
        );
      })()
    );

    if (config.feedUrl) {
      fetchTasks.push(
        (async () => {
          const feedXml = await fetchText(config.feedUrl!, FETCH_TIMEOUT_MS);
          for (const entry of parseRssItems(feedXml, limit)) {
            if (!isAfterCursor(entry.pubDate, input.since)) {
              continue;
            }

            const description = entry.description.slice(0, 500);
            const content = stripHtml(entry.description);

            items.push(
              buildWebsiteItem(config, `${config.sourceId}:post:${entry.guid}`, {
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
        })()
      );
    }

    if (config.commentsFeedUrl) {
      fetchTasks.push(
        (async () => {
          const commentsXml = await fetchText(config.commentsFeedUrl!, FETCH_TIMEOUT_MS).catch(() => '');
          if (!commentsXml) {
            return;
          }

          for (const entry of parseRssItems(commentsXml, maxComments)) {
            if (!isAfterCursor(entry.pubDate, input.since)) {
              continue;
            }

            const description = entry.description.slice(0, 500);
            const content = stripHtml(entry.description);

            items.push(
              buildWebsiteItem(config, `${config.sourceId}:comment:${entry.guid}`, {
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
        })()
      );
    }

    if (config.productsJsonUrl) {
      fetchTasks.push(
        (async () => {
          const productsJson = await fetchText(config.productsJsonUrl!, FETCH_TIMEOUT_MS);
          const products = parseShopifyProducts(productsJson, baseUrl, limit);

          for (const product of products) {
            const handle = product.handle ?? String(product.id ?? 'product');
            const url = `${baseUrl}products/${handle}`;
            const title = product.title ?? 'Product';
            const description = stripHtml(product.body_html ?? '').slice(0, 500);
            const content = description || title;
            const publishedAt = product.updated_at ?? product.created_at ?? collectedAt;

            if (!isAfterCursor(publishedAt, input.since)) {
              continue;
            }

            items.push(
              buildWebsiteItem(config, `${config.sourceId}:product:${handle}`, {
                kind: 'product',
                url,
                title,
                description,
                content,
                metadata: {
                  productType: product.product_type ?? null,
                  tags: product.tags ?? null,
                  source: 'products.json'
                },
                collectedAt,
                publishedAt: new Date(publishedAt).toISOString()
              })
            );
          }
        })()
      );
    }

    await Promise.all(fetchTasks);

    if (config.sitemapUrl) {
      const sitemapItems = await fetchSitemapPages(config, collectedAt, input.since, limit);
      items.push(...sitemapItems);
    }
  } catch (error) {
    errors.push({
      code: 'upstream_error',
      message: error instanceof Error ? error.message : `${config.sourceLabel} fetch failed.`
    });
  }

  if (config.feedUrl && items.length === 1 && errors.length === 0) {
    try {
      const feedXml = await fetchText(config.feedUrl, FETCH_TIMEOUT_MS);
      const channelDescription = parseRssChannelDescription(feedXml);
      const profile = items.find(item => item.rawJson.kind === 'profile');
      if (profile && channelDescription && !profile.rawJson.description) {
        profile.rawJson.description = channelDescription;
        profile.rawJson.content = stripHtml(channelDescription);
      }
    } catch {
      // Optional enrichment only.
    }
  }

  return { items, errors };
}
