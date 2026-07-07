import type { SourceProviderId } from '../../src/modules/sources/providers/source-provider.types';
import { readOpenGraphMetadata } from '../social/read-open-graph-metadata';

export type InstagramPostMetadata = {
  url: string;
  shortcode: string;
  title: string;
  description: string;
  handle: string;
  sourceId: SourceProviderId;
};

function cleanInstagramPostUrl(url: string): string {
  const trimmed = url.trim();
  const withoutQuery = trimmed.split('?')[0] ?? trimmed;
  return withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery;
}

function readShortcode(url: string): string {
  const match = url.match(/\/p\/([^/]+)/i);
  if (!match?.[1]) {
    throw new Error(`Invalid Instagram permalink: ${url}`);
  }
  return match[1];
}

function resolveHandle(description: string, title: string): string {
  const combined = `${description} ${title}`.toLowerCase();
  if (combined.includes('urees__') || combined.includes('@urees')) {
    return 'urees__';
  }
  return 'fiogiuseppe';
}

function resolveSourceId(handle: string): SourceProviderId {
  return handle === 'urees__' ? 'instagram_urees' : 'instagram_personal';
}

function normalizeTitle(title: string, description: string): string {
  const fromTitle = title
    .replace(/^.*? on Instagram:\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  if (fromTitle.length > 20) {
    return fromTitle.slice(0, 200);
  }

  const datedCaption = description.replace(/^[^:]+\s+on\s+[^:]+:\s*/i, '').trim();
  const caption = datedCaption.replace(/^["']|["']$/g, '').trim();
  return caption.slice(0, 200) || 'Instagram post';
}

export async function fetchInstagramPostMetadata(urlInput: string): Promise<InstagramPostMetadata> {
  const url = cleanInstagramPostUrl(urlInput);
  const shortcode = readShortcode(url);

  const response = await fetch(url, {
    headers: {
      // Instagram only embeds og:* tags for link-preview crawlers (not browser UAs).
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Instagram fetch failed (${response.status}) for ${url}`);
  }

  const html = await response.text();
  const meta = readOpenGraphMetadata(html, [
    'og:title',
    'og:description',
    'description',
    'twitter:title',
    'og:url'
  ]);

  const ogTitle = meta['og:title'] || meta['twitter:title'] || '';
  const description = meta['og:description'] || meta.description || ogTitle;

  if (!ogTitle && !description) {
    throw new Error(`No public metadata found for ${url}`);
  }

  const handle = resolveHandle(description, ogTitle);
  const canonicalUrl = meta['og:url'] || url;

  return {
    url: cleanInstagramPostUrl(canonicalUrl),
    shortcode,
    title: normalizeTitle(ogTitle, description),
    description: description.trim(),
    handle,
    sourceId: resolveSourceId(handle)
  };
}
