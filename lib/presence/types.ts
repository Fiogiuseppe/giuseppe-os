export type PresenceChannelId =
  | 'medium'
  | 'website'
  | 'linkedin'
  | 'instagram'
  | 'urees_website'
  | 'urees_instagram';

export type PresenceChannelStatus = 'active' | 'needs_auth' | 'error' | 'unavailable';

export type PresenceItemKind = 'article' | 'post' | 'comment' | 'site_update' | 'visual' | 'product';

export type PresenceItem = {
  id: string;
  channel: PresenceChannelId;
  kind: PresenceItemKind;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
};

export type PresenceComment = {
  id: string;
  channel: PresenceChannelId;
  author: string;
  text: string;
  url?: string;
  publishedAt: string;
  inReplyToTitle?: string;
};

export type GiuseppeOnlineIdentity = {
  displayName: string;
  headline: string;
  bio: string;
  handles: string[];
  canonicalUrls: string[];
  sameAs: string[];
  observedAt: string;
};

export type PresenceChannelReport = {
  id: PresenceChannelId;
  label: string;
  url: string;
  status: PresenceChannelStatus;
  statusNote?: string;
};

export type PresenceReport = {
  generatedAt: string;
  identity: GiuseppeOnlineIdentity;
  channels: PresenceChannelReport[];
  items: PresenceItem[];
  comments: PresenceComment[];
  narrativeSummary: string;
  missionSuggestion: string | null;
  cached: boolean;
};
