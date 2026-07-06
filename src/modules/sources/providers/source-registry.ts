import type { SourceAvailability, SourceProvider, SourceProviderId } from './source-provider.types';

/** Phase 2 catalog — six sources with connector metadata only. */
const PROVIDERS: Record<SourceProviderId, SourceProvider> = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    description: 'Posts, captions, comments, and reach from @fiogiuseppe.',
    category: 'social',
    group: 'personal',
    authMethod: 'oauth',
    profileUrl: 'https://www.instagram.com/fiogiuseppe/',
    permissions: ['Read profile', 'Read media', 'Read comments', 'Read insights'],
    dataCollected: ['Posts', 'Captions', 'Comments', 'Publish dates', 'Engagement metrics']
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Profile posts, comments, and creator analytics for /in/fiogiuseppe.',
    category: 'social',
    group: 'personal',
    authMethod: 'oauth',
    profileUrl: 'https://www.linkedin.com/in/fiogiuseppe/',
    permissions: ['Read member feed', 'Read comments', 'Read post analytics'],
    dataCollected: ['Posts', 'Comments', 'Reactions', 'Impressions (when approved)']
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    description: 'Long-form articles from @fiogiuseppe.',
    category: 'social',
    group: 'personal',
    authMethod: 'feed',
    profileUrl: 'https://medium.com/@fiogiuseppe',
    permissions: ['Read public feed'],
    dataCollected: ['Articles', 'Titles', 'Publish dates', 'Summaries']
  },
  website: {
    id: 'website',
    label: 'fiogiuseppe.com',
    description: 'Site posts and projects from fiogiuseppe.com.',
    category: 'social',
    group: 'personal',
    authMethod: 'feed',
    profileUrl: 'https://fiogiuseppe.com/',
    permissions: ['Read public feed', 'Read comments feed'],
    dataCollected: ['Posts', 'Comments', 'Publish dates', 'Permalinks']
  },
  'urees-instagram': {
    id: 'urees-instagram',
    label: 'UREES Instagram',
    description: 'Brand posts and comments from @urees__.',
    category: 'social',
    group: 'urees',
    authMethod: 'oauth',
    profileUrl: 'https://www.instagram.com/urees__/',
    permissions: ['Read profile', 'Read media', 'Read comments'],
    dataCollected: ['Posts', 'Captions', 'Comments', 'Engagement metrics']
  },
  'urees-website': {
    id: 'urees-website',
    label: 'UREES Website',
    description: 'UREES shop, products, and brand storytelling at urees.shop.',
    category: 'social',
    group: 'urees',
    authMethod: 'feed',
    profileUrl: 'https://urees.shop/',
    permissions: ['Read public products JSON'],
    dataCollected: ['Products', 'Titles', 'Publish dates', 'Shop URLs']
  }
};

export function getSourceProvider(id: SourceProviderId): SourceProvider {
  return PROVIDERS[id];
}

export function listSourceProviders(): SourceProvider[] {
  return Object.values(PROVIDERS);
}

export function isSourceProviderId(value: string): value is SourceProviderId {
  return value in PROVIDERS;
}

export function listProvidersByGroup(groupId: SourceProvider['group']): SourceProvider[] {
  return listSourceProviders().filter(provider => provider.group === groupId);
}

export function isSourceActive(sourceId: SourceProviderId): boolean {
  return sourceId in PROVIDERS;
}

export function getSourceAvailability(sourceId: SourceProviderId): SourceAvailability {
  return isSourceActive(sourceId) ? 'active' : 'future';
}
