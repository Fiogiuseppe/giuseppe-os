import { readFile, writeFile, mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';
import type { TodaysLetterResponse } from './types';

export const CACHE_SCHEMA = 'intelligence-pipeline-v1';

function isServerless(): boolean {
  return process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function cachePath(): string {
  if (process.env.TODAYS_LETTER_CACHE_PATH) {
    return path.resolve(process.env.TODAYS_LETTER_CACHE_PATH);
  }
  if (isServerless()) {
    return path.join(os.tmpdir(), 'giuseppe-todays-letter-cache.json');
  }
  return path.join(process.cwd(), 'memory', 'todays_letter_cache.json');
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
  schemaVersion: string;
  letter: TodaysLetterResponse;
}

function isValidCachedLetter(parsed: LetterCacheFile, dateKey: string): boolean {
  return (
    parsed.dateKey === dateKey &&
    parsed.schemaVersion === CACHE_SCHEMA &&
    Boolean(parsed.letter?.letter) &&
    Boolean(parsed.letter.sections?.thingToFocusOn)
  );
}

export async function readCachedLetter(dateKey: string): Promise<TodaysLetterResponse | null> {
  try {
    const raw = await readFile(cachePath(), 'utf8');
    const parsed = JSON.parse(raw) as LetterCacheFile;
    if (isValidCachedLetter(parsed, dateKey)) {
      return { ...parsed.letter, cached: true };
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeCachedLetter(dateKey: string, letter: TodaysLetterResponse): Promise<boolean> {
  try {
    const target = cachePath();
    await mkdir(path.dirname(target), { recursive: true });
    const payload: LetterCacheFile = {
      dateKey,
      schemaVersion: CACHE_SCHEMA,
      letter: { ...letter, cached: false }
    };
    await writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/** Playwright and explicit file-cache runs should not use the platform data cache. */
export function usePlatformLetterCache(): boolean {
  return !process.env.TODAYS_LETTER_CACHE_PATH;
}
