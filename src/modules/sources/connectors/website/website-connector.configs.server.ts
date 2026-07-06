import { GIUSEPPE_PRESENCE, UREES_PRESENCE } from '../../../../../lib/presence/canonical';
import { OFFICIAL_SOURCE_URLS } from '../../../../../lib/presence/official-source-urls';
import type { WebsiteConnectorConfig } from './website-connector.config.types';
import { buildWebsiteContentHash } from './configurable-website.fetch.server';

const WEBSITE = GIUSEPPE_PRESENCE.channels.website;
const UREES = UREES_PRESENCE.channels.website;

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

const UREES_OFFICIAL_BASE = normalizeBaseUrl(OFFICIAL_SOURCE_URLS.website_urees);

function readEnv(key: string): string | null {
  const value = process.env[key]?.trim();
  return value ? value : null;
}

function buildMockItem(
  config: Pick<WebsiteConnectorConfig, 'owner' | 'sourceLabel' | 'sourceId'>,
  externalId: string,
  fields: {
    kind: string;
    url: string;
    title: string;
    description: string;
    content: string;
    metadata: Record<string, unknown>;
    collectedAt: string;
    publishedAt?: string;
  }
) {
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

export function resolveFiogiuseppeWebsiteConfig(): WebsiteConnectorConfig {
  return {
    sourceId: 'website',
    connectorId: 'website_personal',
    label: WEBSITE.label,
    owner: 'fiogiuseppe',
    sourceLabel: 'fiogiuseppe.com',
    displayName: GIUSEPPE_PRESENCE.displayName,
    baseUrl: WEBSITE.profileUrl,
    feedUrl: WEBSITE.feedUrl,
    commentsFeedUrl: WEBSITE.commentsFeedUrl,
    sitemapUrl: null,
    productsJsonUrl: null,
    maxPages: 12,
    maxComments: 10,
    handles: [...GIUSEPPE_PRESENCE.handles],
    mockFixtures: () => {
      const collectedAt = new Date().toISOString();
      const postUrl = `${WEBSITE.profileUrl}mock-project/`;

      return [
        buildMockItem(
          { sourceId: 'website', owner: 'fiogiuseppe', sourceLabel: 'fiogiuseppe.com' },
          'website:profile',
          {
            kind: 'profile',
            url: WEBSITE.profileUrl,
            title: GIUSEPPE_PRESENCE.displayName,
            description: 'Personal site and projects.',
            content: 'Giuseppe Fioretti — designer, builder, decision intelligence.',
            metadata: { handles: GIUSEPPE_PRESENCE.handles, feedUrl: WEBSITE.feedUrl },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: 'website', owner: 'fiogiuseppe', sourceLabel: 'fiogiuseppe.com' },
          'website:post:mock-project',
          {
            kind: 'post',
            url: postUrl,
            title: 'Visceral Poems — studio update',
            description: 'Visceral Poems explores painting, art, and creative direction.',
            content:
              'Visceral Poems is an ongoing project. UREES branding and brand identity work continues alongside painting and poems.',
            metadata: { categories: ['projects', 'art'], feed: 'posts' },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: 'website', owner: 'fiogiuseppe', sourceLabel: 'fiogiuseppe.com' },
          'website:comment:mock-1',
          {
            kind: 'comment',
            url: WEBSITE.profileUrl,
            title: 'Visitor note',
            description: 'Mock comment fixture.',
            content: 'Mock comment fixture.',
            metadata: { author: 'Visitor', feed: 'comments' },
            collectedAt
          }
        )
      ];
    }
  };
}

export function resolveUreesWebsiteConfig(): WebsiteConnectorConfig {
  const envBaseUrl = readEnv('UREES_WEBSITE_URL');
  const normalizedBase = envBaseUrl ? normalizeBaseUrl(envBaseUrl) : UREES_OFFICIAL_BASE;

  return {
    sourceId: 'urees-website',
    connectorId: 'website_urees',
    label: UREES.label,
    owner: 'urees',
    sourceLabel: 'urees.shop',
    displayName: UREES_PRESENCE.displayName,
    baseUrl: normalizedBase,
    feedUrl: readEnv('UREES_WEBSITE_FEED_URL') ?? `${normalizedBase}feed/`,
    commentsFeedUrl: null,
    sitemapUrl: readEnv('UREES_WEBSITE_SITEMAP_URL') ?? `${normalizedBase}sitemap.xml`,
    productsJsonUrl: readEnv('UREES_WEBSITE_PRODUCTS_URL') ?? UREES.productsUrl,
    maxPages: Number(readEnv('UREES_WEBSITE_MAX_PAGES') ?? '12'),
    handles: [...UREES_PRESENCE.handles],
    mockFixtures: () => {
      const collectedAt = new Date().toISOString();

      return [
        buildMockItem(
          { sourceId: 'urees-website', owner: 'urees', sourceLabel: 'urees.shop' },
          'urees-website:profile',
          {
            kind: 'profile',
            url: UREES_OFFICIAL_BASE,
            title: 'UREES',
            description: 'UREES brand shop and storytelling.',
            content: 'UREES is a brand focused on products, brand identity, and creative storytelling.',
            metadata: { handles: UREES_PRESENCE.handles, productsJsonUrl: UREES.productsUrl },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: 'urees-website', owner: 'urees', sourceLabel: 'urees.shop' },
          'urees-website:product:signature',
          {
            kind: 'product',
            url: `${UREES_OFFICIAL_BASE}products/urees-signature`,
            title: 'UREES Signature Piece',
            description: 'Signature UREES product from the public shop.',
            content: 'UREES signature product — brand storytelling, design, and creative direction.',
            metadata: { productType: 'product', source: 'products.json' },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: 'urees-website', owner: 'urees', sourceLabel: 'urees.shop' },
          'urees-website:story:about',
          {
            kind: 'page',
            url: `${UREES_OFFICIAL_BASE}pages/about`,
            title: 'About UREES',
            description: 'Brand story and creative direction.',
            content: 'UREES explores branding, art, and product storytelling across collections.',
            metadata: { source: 'sitemap' },
            collectedAt
          }
        )
      ];
    }
  };
}

export const FIOGIUSEPPE_WEBSITE_FEED_URLS = {
  posts: WEBSITE.feedUrl,
  comments: WEBSITE.commentsFeedUrl,
  profile: WEBSITE.profileUrl
} as const;
