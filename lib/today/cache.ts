import type { TodayResponse } from './types';

export const TODAY_CACHE_SCHEMA = 'today-engine-v1';

const memoryCache = new Map<string, TodayResponse>();

export function todayDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(now);
}

export function todayCacheKey(dateKey: string, locale: 'it' | 'en' = 'it'): string {
  return `${dateKey}:${locale}`;
}

export function readCachedToday(dateKey: string, locale: 'it' | 'en' = 'it'): TodayResponse | null {
  const cached = memoryCache.get(todayCacheKey(dateKey, locale));
  if (!cached) {
    return null;
  }

  return { ...cached, cached: true };
}

export function writeCachedToday(
  dateKey: string,
  response: TodayResponse,
  locale: 'it' | 'en' = 'it'
): void {
  memoryCache.set(todayCacheKey(dateKey, locale), {
    ...response,
    cached: false
  });
}

export function clearCachedToday(dateKey: string, locale: 'it' | 'en' = 'it'): void {
  memoryCache.delete(todayCacheKey(dateKey, locale));
}

export function usePlatformTodayCache(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

export function resetTodayCacheForTests(): void {
  memoryCache.clear();
}
