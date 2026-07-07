import { getISOWeek, weeklyBoardWeekKey } from '../weekly-board/cache';

const TIMEZONE = 'Europe/Copenhagen';

function copenhagenWeekday(now: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: TIMEZONE }).format(now);
  const map: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return map[name] ?? 1;
}

/** ISO week key for the period the letter reports on (previous week when run on Monday). */
export function weeklyLetterWeekKey(now = new Date()): string {
  const anchor = new Date(now);
  if (copenhagenWeekday(now) === 1) {
    anchor.setDate(anchor.getDate() - 1);
  }
  return weeklyBoardWeekKey(anchor);
}

function parseWeekKey(weekKey: string): { isoYear: number; isoWeek: number } {
  const match = weekKey.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week key: ${weekKey}`);
  }
  return { isoYear: Number(match[1]), isoWeek: Number(match[2]) };
}

function isoWeekMondayUtc(isoYear: number, isoWeek: number): Date {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - day + 1 + (isoWeek - 1) * 7);
  return monday;
}

export function weekBoundsFromKey(weekKey: string): { startIso: string; endIso: string } {
  const { isoYear, isoWeek } = parseWeekKey(weekKey);
  const monday = isoWeekMondayUtc(isoYear, isoWeek);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return {
    startIso: monday.toISOString(),
    endIso: sunday.toISOString()
  };
}

function formatRangeDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

export function formatWeekDateRange(weekKey: string): string {
  const { isoYear, isoWeek } = parseWeekKey(weekKey);
  const monday = isoWeekMondayUtc(isoYear, isoWeek);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return `${formatRangeDate(monday)} – ${formatRangeDate(sunday)}`;
}

export function weekNumberFromKey(weekKey: string): number {
  return parseWeekKey(weekKey).isoWeek;
}

export function weekLabelFromKey(weekKey: string, locale: 'it' | 'en' = 'en'): string {
  const week = weekNumberFromKey(weekKey);
  const year = parseWeekKey(weekKey).isoYear;
  return locale === 'it' ? `Settimana ${week}, ${year}` : `Week ${week}, ${year}`;
}

export function isTimestampInWeek(iso: string, weekKey: string): boolean {
  const { startIso, endIso } = weekBoundsFromKey(weekKey);
  const time = new Date(iso).getTime();
  return time >= new Date(startIso).getTime() && time <= new Date(endIso).getTime();
}

export { getISOWeek };
