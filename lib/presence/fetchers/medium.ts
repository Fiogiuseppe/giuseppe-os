import { GIUSEPPE_PRESENCE } from '../canonical';
import { fetchText } from '../http';
import { parseRssItems } from '../parseRss';
import type { PresenceChannelReport, PresenceItem } from '../types';

export async function fetchMediumPresence(limit = 5): Promise<{
  channel: PresenceChannelReport;
  items: PresenceItem[];
}> {
  const channel: PresenceChannelReport = {
    id: 'medium',
    label: GIUSEPPE_PRESENCE.channels.medium.label,
    url: GIUSEPPE_PRESENCE.channels.medium.profileUrl,
    status: 'active'
  };

  try {
    const xml = await fetchText(GIUSEPPE_PRESENCE.channels.medium.feedUrl);
    const items = parseRssItems(xml, limit).map(entry => ({
      id: `medium:${entry.guid}`,
      channel: 'medium' as const,
      kind: 'article' as const,
      title: entry.title,
      summary: entry.description.slice(0, 320) || entry.categories.join(', '),
      url: entry.link,
      publishedAt: new Date(entry.pubDate).toISOString()
    }));

    return { channel, items };
  } catch (error) {
    return {
      channel: {
        ...channel,
        status: 'error',
        statusNote: error instanceof Error ? error.message : 'Medium feed failed.'
      },
      items: []
    };
  }
}
