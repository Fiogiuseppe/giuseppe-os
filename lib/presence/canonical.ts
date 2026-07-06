import type { PresenceChannelId } from './types';

export const GIUSEPPE_PRESENCE = {
  displayName: 'Giuseppe Fioretti',
  handles: ['@fiogiuseppe', 'fiogiuseppe'],
  channels: {
    medium: {
      id: 'medium' as const,
      label: 'Medium',
      profileUrl: 'https://medium.com/@fiogiuseppe',
      feedUrl: 'https://medium.com/feed/@fiogiuseppe'
    },
    website: {
      id: 'website' as const,
      label: 'fiogiuseppe.com',
      profileUrl: 'https://fiogiuseppe.com/',
      feedUrl: 'https://fiogiuseppe.com/feed/',
      commentsFeedUrl: 'https://fiogiuseppe.com/comments/feed/'
    },
    linkedin: {
      id: 'linkedin' as const,
      label: 'LinkedIn',
      profileUrl: 'https://linkedin.com/in/fiogiuseppe/?skipRedirect=true'
    },
    instagram: {
      id: 'instagram' as const,
      label: 'Instagram',
      profileUrl: 'https://www.instagram.com/fiogiuseppe/',
      handle: '@fiogiuseppe'
    }
  }
} as const;

export const UREES_PRESENCE = {
  displayName: 'UREES',
  handles: ['@urees__', 'urees'],
  channels: {
    website: {
      id: 'urees_website' as const,
      label: 'urees.shop',
      profileUrl: 'https://urees.shop/',
      productsUrl: 'https://urees.shop/products.json'
    },
    instagram: {
      id: 'urees_instagram' as const,
      label: 'UREES Instagram',
      profileUrl: 'https://www.instagram.com/urees__/',
      handle: '@urees__'
    }
  }
} as const;

export const CANONICAL_CHANNEL_ORDER: PresenceChannelId[] = [
  'medium',
  'website',
  'linkedin',
  'instagram',
  'urees_website',
  'urees_instagram'
];
