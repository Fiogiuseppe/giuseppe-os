import { unstable_cache } from 'next/cache';
import type { DailyBriefingResponse } from '../briefing/types';
import { CACHE_SCHEMA } from './cache';

export function getPlatformCachedLetter(
  dateKey: string,
  locale: 'it' | 'en',
  generate: () => Promise<DailyBriefingResponse>
): Promise<DailyBriefingResponse> {
  return unstable_cache(generate, ['giuseppe-daily-briefing', CACHE_SCHEMA, dateKey, locale], {
    revalidate: 86400,
    tags: [`daily-briefing-${dateKey}-${locale}`]
  })();
}
