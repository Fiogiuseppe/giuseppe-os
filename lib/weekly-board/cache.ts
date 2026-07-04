import type { WeeklyBoardResponse } from './types';

const memoryCache = new Map<string, WeeklyBoardResponse>();

const TIMEZONE = 'Europe/Copenhagen';

export function getISOWeek(date: Date): { isoYear: number; isoWeek: number } {
  const copenhagen = new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  );

  const target = new Date(Date.UTC(copenhagen.getFullYear(), copenhagen.getMonth(), copenhagen.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const isoYear = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);

  return { isoYear, isoWeek };
}

export function weeklyBoardWeekKey(now = new Date()): string {
  const { isoYear, isoWeek } = getISOWeek(now);
  return `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
}

export function weeklyBoardCacheKey(weekKey: string, locale: 'it' | 'en' = 'it'): string {
  return `${weekKey}:${locale}`;
}

export function readCachedWeeklyBoard(
  weekKey: string,
  locale: 'it' | 'en' = 'it'
): WeeklyBoardResponse | null {
  const cached = memoryCache.get(weeklyBoardCacheKey(weekKey, locale));
  if (!cached) {
    return null;
  }

  return {
    ...cached,
    cached: true
  };
}

export function writeCachedWeeklyBoard(
  weekKey: string,
  board: WeeklyBoardResponse,
  locale: 'it' | 'en' = 'it'
): void {
  memoryCache.set(weeklyBoardCacheKey(weekKey, locale), {
    ...board,
    cached: false
  });
}

export function clearCachedWeeklyBoard(weekKey: string, locale: 'it' | 'en' = 'it'): void {
  memoryCache.delete(weeklyBoardCacheKey(weekKey, locale));
}

export function resetWeeklyBoardCacheForTests(): void {
  memoryCache.clear();
}

export function formatWeekLabel(weekKey: string, locale: 'it' | 'en' = 'it'): string {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    return weekKey;
  }

  const year = match[1];
  const week = Number(match[2]);
  return locale === 'it' ? `Settimana ${week}, ${year}` : `Week ${week}, ${year}`;
}
