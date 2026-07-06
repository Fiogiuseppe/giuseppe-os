import type { SourceAuthMethod, SourceProviderGroupId } from '../providers/source-provider.types';

export const SOURCE_PROVIDER_IDS = [
  'website_personal',
  'instagram_personal',
  'linkedin_personal',
  'medium_personal',
  'website_urees',
  'instagram_urees'
] as const;

export type SourceProviderId = (typeof SOURCE_PROVIDER_IDS)[number];

/** Legacy aliases accepted at API boundaries — normalized to canonical IDs. */
export const LEGACY_SOURCE_ID_ALIASES: Record<string, SourceProviderId> = {
  website: 'website_personal',
  instagram: 'instagram_personal',
  linkedin: 'linkedin_personal',
  medium: 'medium_personal',
  'urees-website': 'website_urees',
  'urees-instagram': 'instagram_urees'
};

export type SourceConfig = {
  id: SourceProviderId;
  label: string;
  description: string;
  group: SourceProviderGroupId;
  authMethod: SourceAuthMethod;
  officialUrl: string;
  permissions: string[];
  dataCollected: string[];
  connectorId?: string;
  owner?: string;
  sourceLabel?: string;
  feedUrl?: string;
  commentsFeedUrl?: string;
  productsJsonUrl?: string;
  seededHealthNote?: string;
};

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function withTrailingPath(baseUrl: string, path: string): string {
  return `${normalizeBaseUrl(baseUrl)}${path.replace(/^\//, '')}`;
}

const SOURCE_CONFIGS: Record<SourceProviderId, SourceConfig> = {
  website_personal: {
    id: 'website_personal',
    label: 'fiogiuseppe.com',
    description: 'Site posts and projects from fiogiuseppe.com.',
    group: 'personal',
    authMethod: 'feed',
    officialUrl: 'https://fiogiuseppe.com/',
    feedUrl: 'https://fiogiuseppe.com/feed/',
    commentsFeedUrl: 'https://fiogiuseppe.com/comments/feed/',
    connectorId: 'website_personal',
    owner: 'fiogiuseppe',
    sourceLabel: 'fiogiuseppe.com',
    permissions: ['Read public feed', 'Read comments feed'],
    dataCollected: ['Posts', 'Comments', 'Publish dates', 'Permalinks'],
    seededHealthNote: 'Public feeds at fiogiuseppe.com/feed/ — connect to sync.'
  },
  instagram_personal: {
    id: 'instagram_personal',
    label: 'Instagram',
    description: 'Posts, captions, comments, and reach from @fiogiuseppe.',
    group: 'personal',
    authMethod: 'oauth',
    officialUrl: 'https://instagram.com/fiogiuseppe',
    permissions: ['Read profile', 'Read media', 'Read comments', 'Read insights'],
    dataCollected: ['Posts', 'Captions', 'Comments', 'Publish dates', 'Engagement metrics'],
    seededHealthNote: 'OAuth foundation ready — provider not implemented yet.'
  },
  linkedin_personal: {
    id: 'linkedin_personal',
    label: 'LinkedIn',
    description: 'Profile posts, comments, and creator analytics for /in/fiogiuseppe.',
    group: 'personal',
    authMethod: 'oauth',
    officialUrl: 'https://linkedin.com/in/fiogiuseppe/?skipRedirect=true',
    permissions: ['Read member feed', 'Read comments', 'Read post analytics'],
    dataCollected: ['Posts', 'Comments', 'Reactions', 'Impressions (when approved)'],
    seededHealthNote: 'OAuth foundation ready — provider not implemented yet.'
  },
  medium_personal: {
    id: 'medium_personal',
    label: 'Medium',
    description: 'Long-form articles from @fiogiuseppe.',
    group: 'personal',
    authMethod: 'feed',
    officialUrl: 'https://medium.com/@fiogiuseppe',
    feedUrl: 'https://medium.com/feed/@fiogiuseppe',
    connectorId: 'medium_personal',
    owner: 'fiogiuseppe',
    sourceLabel: 'medium.com',
    permissions: ['Read public feed'],
    dataCollected: ['Articles', 'Titles', 'Publish dates', 'Summaries', 'Tags'],
    seededHealthNote: 'Public RSS at medium.com/feed/@fiogiuseppe — connect to sync.'
  },
  website_urees: {
    id: 'website_urees',
    label: 'UREES Website',
    description: 'UREES shop, products, and brand storytelling at urees.shop.',
    group: 'urees',
    authMethod: 'feed',
    officialUrl: 'https://urees.shop/',
    feedUrl: withTrailingPath('https://urees.shop/', 'feed/'),
    productsJsonUrl: 'https://urees.shop/products.json',
    connectorId: 'website_urees',
    owner: 'urees',
    sourceLabel: 'urees.shop',
    permissions: ['Read public products JSON'],
    dataCollected: ['Products', 'Titles', 'Publish dates', 'Shop URLs'],
    seededHealthNote: 'Public site at urees.shop — connect to sync.'
  },
  instagram_urees: {
    id: 'instagram_urees',
    label: 'UREES Instagram',
    description: 'Brand posts and comments from @urees__.',
    group: 'urees',
    authMethod: 'oauth',
    officialUrl: 'https://www.instagram.com/urees__/',
    permissions: ['Read profile', 'Read media', 'Read comments'],
    dataCollected: ['Posts', 'Captions', 'Comments', 'Engagement metrics'],
    seededHealthNote: 'OAuth foundation ready — provider not implemented yet.'
  }
};

export function normalizeSourceId(value: string): SourceProviderId | null {
  if ((SOURCE_PROVIDER_IDS as readonly string[]).includes(value)) {
    return value as SourceProviderId;
  }

  return LEGACY_SOURCE_ID_ALIASES[value] ?? null;
}

export function isCanonicalSourceId(value: string): value is SourceProviderId {
  return (SOURCE_PROVIDER_IDS as readonly string[]).includes(value);
}

export function getSourceConfig(sourceId: string): SourceConfig | null {
  const normalized = normalizeSourceId(sourceId);
  if (!normalized) {
    return null;
  }

  return SOURCE_CONFIGS[normalized];
}

export function requireSourceConfig(sourceId: string): SourceConfig {
  const config = getSourceConfig(sourceId);
  if (!config) {
    throw new Error(`Unknown source ID: ${sourceId}`);
  }

  return config;
}

export function listSourceConfigs(): SourceConfig[] {
  return SOURCE_PROVIDER_IDS.map(id => SOURCE_CONFIGS[id]);
}

export function getOfficialSourceUrl(sourceId: string): string | null {
  return getSourceConfig(sourceId)?.officialUrl ?? null;
}

export function resolveWebsiteBaseUrl(sourceId: SourceProviderId): string {
  const config = requireSourceConfig(sourceId);
  const envOverride =
    sourceId === 'website_urees' ? process.env.UREES_WEBSITE_URL?.trim() : undefined;
  return normalizeBaseUrl(envOverride || config.officialUrl);
}

export function resolveWebsiteProductsJsonUrl(sourceId: 'website_urees'): string {
  const config = requireSourceConfig(sourceId);
  const envOverride = process.env.UREES_WEBSITE_PRODUCTS_URL?.trim();
  return envOverride || config.productsJsonUrl || `${resolveWebsiteBaseUrl(sourceId)}products.json`;
}
