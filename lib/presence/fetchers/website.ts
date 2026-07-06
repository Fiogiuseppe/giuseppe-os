import { GIUSEPPE_PRESENCE } from '../canonical';
import { fetchText } from '../http';
import { parseRssChannelDescription, parseRssItems } from '../parseRss';
import type { GiuseppeOnlineIdentity, PresenceChannelReport, PresenceComment, PresenceItem } from '../types';

function readMetaContent(html: string, property: string): string {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i')
  );
  return match?.[1]?.trim() ?? '';
}

function readJsonLdPerson(html: string): Partial<GiuseppeOnlineIdentity> {
  const scripts = Array.from(html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi));
  for (const script of scripts) {
    try {
      const json = JSON.parse(script[1]) as {
        '@graph'?: Array<Record<string, unknown>>;
      };
      const graph = json['@graph'] ?? [];
      const person = graph.find(node => {
        const type = node['@type'];
        return Array.isArray(type) ? type.includes('Person') : type === 'Person';
      });
      if (!person) {
        continue;
      }

      const sameAs = Array.isArray(person.sameAs)
        ? person.sameAs.filter((value): value is string => typeof value === 'string')
        : [];

      return {
        displayName: typeof person.name === 'string' ? person.name : GIUSEPPE_PRESENCE.displayName,
        headline: typeof person.jobTitle === 'string' ? person.jobTitle : 'Graphic Designer & Art Director',
        bio: typeof person.description === 'string' ? person.description : '',
        sameAs
      };
    } catch {
      // try next script block
    }
  }

  return {};
}

export async function fetchWebsitePresence(limit = 4): Promise<{
  channel: PresenceChannelReport;
  items: PresenceItem[];
  comments: PresenceComment[];
  identity: Partial<GiuseppeOnlineIdentity>;
}> {
  const channel: PresenceChannelReport = {
    id: 'website',
    label: GIUSEPPE_PRESENCE.channels.website.label,
    url: GIUSEPPE_PRESENCE.channels.website.profileUrl,
    status: 'active'
  };

  try {
    const [homeHtml, feedXml, commentsXml] = await Promise.all([
      fetchText(GIUSEPPE_PRESENCE.channels.website.profileUrl),
      fetchText(GIUSEPPE_PRESENCE.channels.website.feedUrl),
      fetchText(GIUSEPPE_PRESENCE.channels.website.commentsFeedUrl).catch(() => '')
    ]);

    const jsonLd = readJsonLdPerson(homeHtml);
    const identity: Partial<GiuseppeOnlineIdentity> = {
      displayName: jsonLd.displayName ?? GIUSEPPE_PRESENCE.displayName,
      headline:
        jsonLd.headline ||
        readMetaContent(homeHtml, 'og:title') ||
        'Graphic Designer & Art Director',
      bio:
        jsonLd.bio ||
        readMetaContent(homeHtml, 'description') ||
        parseRssChannelDescription(feedXml),
      sameAs: jsonLd.sameAs ?? []
    };

    const items = parseRssItems(feedXml, limit).map(entry => ({
      id: `website:${entry.guid}`,
      channel: 'website' as const,
      kind: 'site_update' as const,
      title: entry.title,
      summary: entry.description.slice(0, 320),
      url: entry.link,
      publishedAt: new Date(entry.pubDate).toISOString()
    }));

    const comments = parseRssItems(commentsXml, 10).map(entry => ({
      id: `website-comment:${entry.guid}`,
      channel: 'website' as const,
      author: entry.creator || 'Visitor',
      text: entry.title ? `${entry.title} — ${entry.description}` : entry.description,
      url: entry.link,
      publishedAt: new Date(entry.pubDate).toISOString()
    }));

    return { channel, items, comments, identity };
  } catch (error) {
    return {
      channel: {
        ...channel,
        status: 'error',
        statusNote: error instanceof Error ? error.message : 'Website fetch failed.'
      },
      items: [],
      comments: [],
      identity: {}
    };
  }
}
