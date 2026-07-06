import type { SourceActionRequest } from '../providers/source-provider.types';
import { normalizeSourceId } from '../config/source-config';

function isValidSourceAction(value: unknown): value is SourceActionRequest['action'] {
  return value === 'connect' || value === 'disconnect' || value === 'sync';
}

export function parseSourceActionRequest(body: unknown): SourceActionRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const row = body as Record<string, unknown>;
  const sourceId = normalizeSourceId(String(row.sourceId ?? ''));
  if (!sourceId || !isValidSourceAction(row.action)) {
    return null;
  }

  return {
    sourceId,
    action: row.action
  };
}

export function getOAuthConnectRoute(sourceId: SourceActionRequest['sourceId']): string {
  return `/api/sources/${sourceId}/connect`;
}
