import type { DailyBriefingResponse } from '../briefing/types';

export const CACHE_SCHEMA = 'daily-briefing-v4';

const memoryCache = new Map<string, DailyBriefingResponse>();

export function letterDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(now);
}

export function readCachedLetter(dateKey: string): DailyBriefingResponse | null {
  const cached = memoryCache.get(dateKey);
  if (!cached) {
    return null;
  }

  return {
    ...cached,
    cached: true
  };
}

export function writeCachedLetter(dateKey: string, letter: DailyBriefingResponse): void {
  memoryCache.set(dateKey, {
    ...letter,
    cached: false,
    letter: letter.briefing
  });
}

/** Production uses Next.js unstable_cache; dev uses in-process memory only. */
export function usePlatformLetterCache(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export function resetLetterCacheForTests(): void {
  memoryCache.clear();
}
