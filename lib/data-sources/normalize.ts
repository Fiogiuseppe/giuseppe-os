import type {
  DataSourceId,
  NormalizedSourceItem,
  NormalizedSourceItemKind,
  RawSourceItem,
  SourceMetrics
} from './types';

function readString(raw: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function readStringArray(raw: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const value = raw[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  }
  return [];
}

function readMetrics(raw: Record<string, unknown>): SourceMetrics | null {
  const metricsRaw = raw.metrics;
  if (!metricsRaw || typeof metricsRaw !== 'object') {
    return null;
  }

  const metrics: SourceMetrics = {};
  for (const [key, value] of Object.entries(metricsRaw as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      metrics[key] = value;
    }
  }

  return Object.keys(metrics).length > 0 ? metrics : null;
}

function inferKind(source: DataSourceId, raw: Record<string, unknown>): NormalizedSourceItemKind {
  const explicit = readString(raw, ['kind', 'type']);
  if (explicit) {
    return explicit as NormalizedSourceItemKind;
  }

  switch (source) {
    case 'instagram':
    case 'linkedin':
      return 'post';
    case 'calendar':
      return 'event';
    case 'gmail':
      return 'email';
    case 'github':
      return 'commit';
    case 'spotify':
      return 'track';
    case 'figma':
      return 'design';
    case 'books':
      return 'reading';
    case 'health':
      return 'health_metric';
    case 'manual_import':
      return 'import';
    case 'website':
      return 'post';
    default:
      return 'unknown';
  }
}

function buildNormalizedId(source: DataSourceId, account: string, externalId: string): string {
  return `norm_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}_${externalId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

export function normalizeRawSourceItem(rawItem: RawSourceItem, now = new Date().toISOString()): NormalizedSourceItem {
  const raw = rawItem.rawJson;
  const content =
    readString(raw, ['content', 'text', 'body', 'message', 'title', 'subject']) ||
    readString(raw, ['caption', 'description', 'summary']);
  const caption = readString(raw, ['caption']) || null;
  const mediaUrls = readStringArray(raw, ['media_urls', 'mediaUrls', 'images', 'attachments']);
  const publishedAt =
    readString(raw, ['published_at', 'publishedAt', 'created_at', 'createdAt', 'timestamp']) ||
    rawItem.fetchedAt;
  const permalink =
    readString(raw, ['permalink', 'source_url', 'sourceUrl', 'url', 'link']) ||
    `source://${rawItem.source}/${rawItem.account}/${rawItem.externalId}`;

  return {
    id: buildNormalizedId(rawItem.source, rawItem.account, rawItem.externalId),
    rawItemId: rawItem.id,
    source: rawItem.source,
    account: rawItem.account,
    externalId: rawItem.externalId,
    content,
    caption,
    mediaUrls,
    publishedAt: new Date(publishedAt).toISOString(),
    permalink,
    metrics: readMetrics(raw),
    kind: inferKind(rawItem.source, raw),
    createdAt: now
  };
}
