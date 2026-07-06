import type { SourceProviderId } from '../../providers/source-provider.types';

type RateLimitBucket = {
  windowStartedAt: number;
  count: number;
};

const buckets = new Map<SourceProviderId, RateLimitBucket>();

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 30;

export function assertRateLimit(
  sourceId: SourceProviderId,
  options: { windowMs?: number; maxRequests?: number } = {}
): void {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const now = Date.now();

  const current = buckets.get(sourceId);
  if (!current || now - current.windowStartedAt >= windowMs) {
    buckets.set(sourceId, { windowStartedAt: now, count: 1 });
    return;
  }

  if (current.count >= maxRequests) {
    throw new Error('Rate limit exceeded for this source. Try again shortly.');
  }

  current.count += 1;
  buckets.set(sourceId, current);
}

export function resetRateLimiterForTests(): void {
  buckets.clear();
}
