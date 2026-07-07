import type { StoredWeeklyLetter, WeeklyLetterResponse } from './types';

const memoryCache = new Map<string, StoredWeeklyLetter>();

export function readCachedWeeklyLetter(weekKey: string): StoredWeeklyLetter | null {
  const cached = memoryCache.get(weekKey);
  if (!cached) {
    return null;
  }

  return { ...cached, cached: true };
}

export function writeCachedWeeklyLetter(letter: StoredWeeklyLetter): void {
  memoryCache.set(letter.weekKey, { ...letter, cached: false });
}

export function resetWeeklyLetterCacheForTests(): void {
  memoryCache.clear();
}

export function toStoredWeeklyLetter(
  letter: WeeklyLetterResponse,
  htmlBody: string,
  emailSentAt: string | null = null
): StoredWeeklyLetter {
  return {
    ...letter,
    htmlBody,
    emailSentAt,
    cached: false
  };
}
