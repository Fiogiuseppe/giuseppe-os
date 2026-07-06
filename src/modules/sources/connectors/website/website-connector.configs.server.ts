import {
  getSourceConfig,
  requireSourceConfig,
  resolveWebsiteBaseUrl,
  resolveWebsiteProductsJsonUrl
} from '../../config/source-config';
import type { WebsiteConnectorConfig } from './website-connector.config.types';
import { buildWebsiteContentHash } from './configurable-website.fetch.server';

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
  const source = requireSourceConfig('website_personal');
  const baseUrl = source.officialUrl;

  return {
    sourceId: source.id,
    connectorId: source.connectorId ?? source.id,
    label: source.label,
    owner: source.owner ?? 'fiogiuseppe',
    sourceLabel: source.sourceLabel ?? 'fiogiuseppe.com',
    displayName: 'Giuseppe Fioretti',
    baseUrl,
    feedUrl: source.feedUrl ?? null,
    commentsFeedUrl: source.commentsFeedUrl ?? null,
    sitemapUrl: null,
    productsJsonUrl: null,
    maxPages: 12,
    maxComments: 10,
    handles: ['@fiogiuseppe', 'fiogiuseppe'],
    mockFixtures: () => {
      const collectedAt = new Date().toISOString();
      const postUrl = `${baseUrl}mock-project/`;

      return [
        buildMockItem(
          { sourceId: source.id, owner: source.owner!, sourceLabel: source.sourceLabel! },
          `${source.id}:profile`,
          {
            kind: 'profile',
            url: baseUrl,
            title: 'Giuseppe Fioretti',
            description: 'Personal site and projects.',
            content: 'Giuseppe Fioretti — designer, builder, decision intelligence.',
            metadata: { handles: ['@fiogiuseppe', 'fiogiuseppe'], feedUrl: source.feedUrl },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: source.id, owner: source.owner!, sourceLabel: source.sourceLabel! },
          `${source.id}:post:mock-project`,
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
          { sourceId: source.id, owner: source.owner!, sourceLabel: source.sourceLabel! },
          `${source.id}:comment:mock-1`,
          {
            kind: 'comment',
            url: baseUrl,
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
  const source = requireSourceConfig('website_urees');
  const normalizedBase = resolveWebsiteBaseUrl('website_urees');

  return {
    sourceId: source.id,
    connectorId: source.connectorId ?? source.id,
    label: source.label,
    owner: source.owner ?? 'urees',
    sourceLabel: source.sourceLabel ?? 'urees.shop',
    displayName: 'UREES',
    baseUrl: normalizedBase,
    feedUrl: readEnv('UREES_WEBSITE_FEED_URL') ?? source.feedUrl ?? `${normalizedBase}feed/`,
    commentsFeedUrl: null,
    sitemapUrl: readEnv('UREES_WEBSITE_SITEMAP_URL') ?? `${normalizedBase}sitemap.xml`,
    productsJsonUrl: resolveWebsiteProductsJsonUrl('website_urees'),
    maxPages: Number(readEnv('UREES_WEBSITE_MAX_PAGES') ?? '12'),
    handles: ['@urees__', 'urees'],
    mockFixtures: () => {
      const collectedAt = new Date().toISOString();
      const productsJsonUrl = resolveWebsiteProductsJsonUrl('website_urees');

      return [
        buildMockItem(
          { sourceId: source.id, owner: source.owner!, sourceLabel: source.sourceLabel! },
          `${source.id}:profile`,
          {
            kind: 'profile',
            url: normalizedBase,
            title: 'UREES',
            description: 'UREES brand shop and storytelling.',
            content: 'UREES is a brand focused on products, brand identity, and creative storytelling.',
            metadata: { handles: ['@urees__', 'urees'], productsJsonUrl },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: source.id, owner: source.owner!, sourceLabel: source.sourceLabel! },
          `${source.id}:product:signature`,
          {
            kind: 'product',
            url: `${normalizedBase}products/urees-signature`,
            title: 'UREES Signature Piece',
            description: 'Signature UREES product from the public shop.',
            content: 'UREES signature product — brand storytelling, design, and creative direction.',
            metadata: { productType: 'product', source: 'products.json' },
            collectedAt
          }
        ),
        buildMockItem(
          { sourceId: source.id, owner: source.owner!, sourceLabel: source.sourceLabel! },
          `${source.id}:story:about`,
          {
            kind: 'page',
            url: `${normalizedBase}pages/about`,
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

export function resolveWebsiteConnectorConfig(sourceId: 'website_personal' | 'website_urees') {
  return sourceId === 'website_personal'
    ? resolveFiogiuseppeWebsiteConfig()
    : resolveUreesWebsiteConfig();
}

const personalWebsite = getSourceConfig('website_personal');

export const FIOGIUSEPPE_WEBSITE_FEED_URLS = {
  posts: personalWebsite?.feedUrl ?? '',
  comments: personalWebsite?.commentsFeedUrl ?? '',
  profile: personalWebsite?.officialUrl ?? ''
} as const;
