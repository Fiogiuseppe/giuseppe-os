import type { PresenceReport } from './types';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cached: { key: string; expiresAt: number; report: PresenceReport } | null = null;

function cacheKey(locale: string, regenerate: boolean): string {
  const hourBucket = Math.floor(Date.now() / CACHE_TTL_MS);
  return `${locale}:${hourBucket}:${regenerate ? '1' : '0'}`;
}

export function readCachedPresence(locale: string): PresenceReport | null {
  if (!cached || cached.expiresAt < Date.now()) {
    return null;
  }
  if (!cached.key.startsWith(`${locale}:`)) {
    return null;
  }
  return { ...cached.report, cached: true };
}

export function writeCachedPresence(locale: string, regenerate: boolean, report: PresenceReport): void {
  cached = {
    key: cacheKey(locale, regenerate),
    expiresAt: Date.now() + CACHE_TTL_MS,
    report: { ...report, cached: false }
  };
}

export function clearCachedPresence(): void {
  cached = null;
}
