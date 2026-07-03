import { unstable_cache } from 'next/cache';
import { CACHE_SCHEMA } from './cache';
import type { TodaysLetterResponse } from './types';

export function getPlatformCachedLetter(
  dateKey: string,
  generate: () => Promise<TodaysLetterResponse>
): Promise<TodaysLetterResponse> {
  return unstable_cache(generate, ['giuseppe-todays-letter', CACHE_SCHEMA, dateKey], {
    revalidate: 86400,
    tags: [`todays-letter-${dateKey}`]
  })();
}
