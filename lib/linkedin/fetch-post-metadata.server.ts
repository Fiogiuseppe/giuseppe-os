import { readOpenGraphMetadata } from '../social/read-open-graph-metadata';

export type LinkedInPostMetadata = {
  url: string;
  activityId: string;
  title: string;
  description: string;
};

function cleanLinkedInPostUrl(url: string): string {
  const trimmed = url.trim();
  const withoutQuery = trimmed.split('?')[0] ?? trimmed;
  return withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery;
}

function readActivityId(url: string): string {
  const match = url.match(/activity-(\d+-[A-Za-z0-9_-]+)/);
  return match?.[1] ?? url.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 64);
}

function normalizeTitle(title: string): string {
  const withoutAuthor = title.split('| Giuseppe Fioretti')[0]?.trim() ?? title.trim();
  const withoutComments = withoutAuthor.replace(/\s+\d+\s+comments?$/i, '').trim();
  return withoutComments;
}

export async function fetchLinkedInPostMetadata(urlInput: string): Promise<LinkedInPostMetadata> {
  const url = cleanLinkedInPostUrl(urlInput);
  const activityId = readActivityId(url);

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml'
    },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`LinkedIn fetch failed (${response.status}) for ${url}`);
  }

  const html = await response.text();
  const meta = readOpenGraphMetadata(html, ['og:title', 'og:description', 'description']);
  const ogTitle = meta['og:title'] || '';
  const description = meta['og:description'] || meta.description || ogTitle;

  if (!ogTitle && !description) {
    throw new Error(`No public metadata found for ${url}`);
  }

  return {
    url,
    activityId,
    title: normalizeTitle(ogTitle || description.slice(0, 120)),
    description: description.trim()
  };
}
