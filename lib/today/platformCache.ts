import { unstable_cache } from 'next/cache';
import type { TodayResponse } from './types';
import { TODAY_CACHE_SCHEMA } from './cache';

export function getPlatformCachedToday(
  dateKey: string,
  locale: 'it' | 'en',
  generate: () => Promise<TodayResponse>
): Promise<TodayResponse> {
  return unstable_cache(generate, ['giuseppe-today', TODAY_CACHE_SCHEMA, dateKey, locale], {
    revalidate: 86400,
    tags: [`today-${dateKey}-${locale}`]
  })();
}
