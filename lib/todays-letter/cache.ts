import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { TodaysLetterResponse } from './types';

const DEFAULT_CACHE_PATH = path.join(process.cwd(), 'memory', 'todays_letter_cache.json');

function cachePath(): string {
  return process.env.TODAYS_LETTER_CACHE_PATH
    ? path.resolve(process.env.TODAYS_LETTER_CACHE_PATH)
    : DEFAULT_CACHE_PATH;
}

export function letterDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(now);
}

interface LetterCacheFile {
  dateKey: string;
  letter: TodaysLetterResponse;
}

export async function readCachedLetter(dateKey: string): Promise<TodaysLetterResponse | null> {
  try {
    const raw = await readFile(cachePath(), 'utf8');
    const parsed = JSON.parse(raw) as LetterCacheFile;
    if (parsed.dateKey === dateKey && parsed.letter?.letter) {
      return { ...parsed.letter, cached: true };
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeCachedLetter(dateKey: string, letter: TodaysLetterResponse): Promise<void> {
  const target = cachePath();
  await mkdir(path.dirname(target), { recursive: true });
  const payload: LetterCacheFile = { dateKey, letter: { ...letter, cached: false } };
  await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}
