import { resolveLocale, type AppLocale } from '../i18n/locale';
import { GIUSEPPE_PRESENCE, UREES_PRESENCE } from './canonical';
import { clearCachedPresence, readCachedPresence, writeCachedPresence } from './cache';
import { fetchMediumPresence } from './fetchers/medium';
import {
  instagramPresenceChannel,
  linkedinPresenceChannel,
  ureesInstagramPresenceChannel
} from './fetchers/social';
import { fetchUreesShopPresence } from './fetchers/urees';
import { fetchWebsitePresence } from './fetchers/website';
import { buildMissionSuggestion, buildNarrativeSummary } from './summarize';
import type { GiuseppeOnlineIdentity, PresenceReport } from './types';

export type RunPresenceOptions = {
  regenerate?: boolean;
};

function buildIdentity(websiteIdentity: Partial<GiuseppeOnlineIdentity>): GiuseppeOnlineIdentity {
  const canonicalUrls = [
    GIUSEPPE_PRESENCE.channels.medium.profileUrl,
    GIUSEPPE_PRESENCE.channels.website.profileUrl,
    GIUSEPPE_PRESENCE.channels.linkedin.profileUrl,
    GIUSEPPE_PRESENCE.channels.instagram.profileUrl,
    UREES_PRESENCE.channels.website.profileUrl,
    UREES_PRESENCE.channels.instagram.profileUrl
  ];

  return {
    displayName: websiteIdentity.displayName ?? GIUSEPPE_PRESENCE.displayName,
    headline: websiteIdentity.headline ?? 'Graphic Designer & Art Director',
    bio:
      websiteIdentity.bio ??
      'Italian designer and artist based in Copenhagen. LEGO Group, branding, storytelling, play.',
    handles: [...GIUSEPPE_PRESENCE.handles],
    canonicalUrls,
    sameAs:
      websiteIdentity.sameAs && websiteIdentity.sameAs.length > 0
        ? websiteIdentity.sameAs
        : canonicalUrls,
    observedAt: new Date().toISOString()
  };
}

export async function runPresenceScan(
  localeInput?: AppLocale,
  options: RunPresenceOptions = {}
): Promise<PresenceReport> {
  const locale = resolveLocale(localeInput);
  const regenerate = options.regenerate === true;

  if (regenerate) {
    clearCachedPresence();
  } else {
    const cached = readCachedPresence(locale);
    if (cached) {
      return cached;
    }
  }

  const [medium, website, ureesShop] = await Promise.all([
    fetchMediumPresence(),
    fetchWebsitePresence(),
    fetchUreesShopPresence()
  ]);

  const items = [...medium.items, ...website.items, ...ureesShop.items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const comments = [...website.comments];
  const identity = buildIdentity(website.identity);
  const narrativeSummary = buildNarrativeSummary(locale, items, comments);
  const missionSuggestion = await buildMissionSuggestion(locale, items);

  const report: PresenceReport = {
    generatedAt: new Date().toISOString(),
    identity,
    channels: [
      medium.channel,
      website.channel,
      linkedinPresenceChannel(),
      instagramPresenceChannel(),
      ureesShop.channel,
      ureesInstagramPresenceChannel()
    ],
    items,
    comments,
    narrativeSummary,
    missionSuggestion,
    cached: false
  };

  writeCachedPresence(locale, regenerate, report);
  return report;
}
