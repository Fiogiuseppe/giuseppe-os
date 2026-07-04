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

export function letterCacheKey(dateKey: string, locale: 'it' | 'en' = 'it'): string {
  return `${dateKey}:${locale}`;
}

export function readCachedLetter(dateKey: string, locale: 'it' | 'en' = 'it'): DailyBriefingResponse | null {
  const cached = memoryCache.get(letterCacheKey(dateKey, locale));
  if (!cached) {
    return null;
  }

  return {
    ...cached,
    cached: true
  };
}

export function writeCachedLetter(dateKey: string, letter: DailyBriefingResponse, locale: 'it' | 'en' = 'it'): void {
  memoryCache.set(letterCacheKey(dateKey, locale), {
    ...letter,
    cached: false,
    letter: letter.briefing
  });
}

/** Production uses Next.js unstable_cache; dev uses in-process memory only. */
export function usePlatformLetterCache(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export function clearCachedLetter(dateKey: string, locale: 'it' | 'en' = 'it'): void {
  memoryCache.delete(letterCacheKey(dateKey, locale));
}

export function resetLetterCacheForTests(): void {
  memoryCache.clear();
}
