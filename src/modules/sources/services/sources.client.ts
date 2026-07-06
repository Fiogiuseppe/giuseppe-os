import type {
  SourceAction,
  SourceActionRequest,
  SourceActionResponse,
  SourceProviderId,
  SourcesListResponse
} from '../providers/source-provider.types';

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Sources request failed.');
  }
  return body;
}

export function getOAuthConnectPath(sourceId: SourceProviderId): string {
  return `/api/sources/${sourceId}/oauth/connect`;
}

export function startOAuthConnect(sourceId: SourceProviderId): void {
  window.location.assign(getOAuthConnectPath(sourceId));
}

export async function fetchSources(): Promise<SourcesListResponse> {
  const response = await fetch('/api/sources', { cache: 'no-store' });
  return parseJson<SourcesListResponse>(response);
}

export async function runSourceAction(
  sourceId: SourceProviderId,
  action: SourceAction
): Promise<SourceActionResponse> {
  const payload: SourceActionRequest = { sourceId, action };
  const response = await fetch('/api/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseJson<SourceActionResponse>(response);
}
