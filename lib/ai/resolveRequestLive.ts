import { hasAnthropicApiKey } from './mode';

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

export function resolveRequestAILive(
  request: Request,
  body?: Record<string, unknown> | null
): boolean {
  const fromBody = parseBodyAiLive(body);
  if (fromBody !== null) {
    return fromBody && hasAnthropicApiKey();
  }

  const fromHeader = parseHeaderAiLive(request);
  if (fromHeader !== null) {
    return fromHeader && hasAnthropicApiKey();
  }

  return false;
}
