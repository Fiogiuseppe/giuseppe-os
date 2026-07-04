import { hasAnthropicApiKey, isClientAiToggleAllowed } from './mode';

function parseBodyAiLive(body: Record<string, unknown> | null | undefined): boolean | null {
  if (body?.aiLive === true) {
    return true;
  }
  if (body?.aiLive === false) {
    return false;
  }
  return null;
}

function parseHeaderAiLive(request: Request): boolean | null {
  const header = request.headers.get('X-Giuseppe-AI-Live')?.trim().toLowerCase();
  if (header === 'on') {
    return true;
  }
  if (header === 'off') {
    return false;
  }
  return null;
}

function parseClientAiLivePreference(
  request: Request,
  body?: Record<string, unknown> | null
): boolean | null {
  const fromBody = parseBodyAiLive(body);
  if (fromBody !== null) {
    return fromBody;
  }

  return parseHeaderAiLive(request);
}

export function resolveRequestAILive(
  request: Request,
  body?: Record<string, unknown> | null
): boolean {
  if (!hasAnthropicApiKey()) {
    return false;
  }

  if (!isClientAiToggleAllowed()) {
    return false;
  }

  const preference = parseClientAiLivePreference(request, body);
  if (preference === null) {
    return false;
  }

  return preference;
}
