import type { AwarenessInsight } from '../../engine/awarenessEngine';
import { runAwarenessEngine } from '../../engine/awarenessEngine';
import { isAILiveMode } from '../ai/mode';
import { runWithAICallMeta } from '../ai/callContext';
import { runExecutiveBrain } from '../brain/executiveBrain';
import { loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import type { AppLocale } from '../i18n/locale';
import { resolveLocale } from '../i18n/locale';

export type MonthlyInsightSource = 'local' | 'live';

export type MonthlyInsightResponse = {
  insight: AwarenessInsight;
  monthKey: string;
  source: MonthlyInsightSource;
  cached: boolean;
};

const memoryCache = new Map<string, MonthlyInsightResponse>();

export function insightMonthKey(now = new Date()): string {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(now);

  return formatted.slice(0, 7);
}

function cacheKey(monthKey: string, locale: AppLocale): string {
  return `${monthKey}:${locale}`;
}

export function readCachedMonthlyInsight(
  monthKey: string,
  locale: AppLocale = 'it'
): MonthlyInsightResponse | null {
  const cached = memoryCache.get(cacheKey(monthKey, locale));
  if (!cached) {
    return null;
  }

  return {
    ...cached,
    cached: true
  };
}

export function writeCachedMonthlyInsight(
  monthKey: string,
  locale: AppLocale,
  payload: Omit<MonthlyInsightResponse, 'cached'>
): void {
  memoryCache.set(cacheKey(monthKey, locale), {
    ...payload,
    cached: false
  });
}

export function clearCachedMonthlyInsight(monthKey: string, locale: AppLocale = 'it'): void {
  memoryCache.delete(cacheKey(monthKey, locale));
}

export function resetMonthlyInsightCacheForTests(): void {
  memoryCache.clear();
}

export async function generateLocalMonthlyInsight(
  localeInput?: AppLocale
): Promise<MonthlyInsightResponse> {
  const locale = resolveLocale(localeInput);
  const monthKey = insightMonthKey();
  const [longTerm, working] = await Promise.all([loadLongTermMemory(), loadWorkingMemory()]);
  const insight = runAwarenessEngine({
    proactive: true,
    longTerm,
    working,
    locale
  });

  return {
    insight,
    monthKey,
    source: 'local',
    cached: false
  };
}

export async function generateLiveMonthlyInsight(
  localeInput?: AppLocale
): Promise<MonthlyInsightResponse> {
  if (!isAILiveMode()) {
    throw new Error('Live AI is disabled.');
  }

  const locale = resolveLocale(localeInput);
  const monthKey = insightMonthKey();

  const response = await runWithAICallMeta(
    { page: 'insights', reason: 'monthly-regenerate' },
    () =>
      runExecutiveBrain({
        intent: 'awareness',
        message: 'Generate the monthly insight for Giuseppe.',
        persist: true,
        locale
      })
  );

  if (!response.awareness) {
    throw new Error('Monthly insight generation returned no awareness payload.');
  }

  return {
    insight: response.awareness,
    monthKey,
    source: 'live',
    cached: false
  };
}

export type GetMonthlyInsightOptions = {
  regenerate?: boolean;
};

export async function getMonthlyInsight(
  localeInput?: AppLocale,
  options: GetMonthlyInsightOptions = {}
): Promise<MonthlyInsightResponse> {
  const locale = resolveLocale(localeInput);
  const monthKey = insightMonthKey();
  const regenerate = options.regenerate === true;

  if (regenerate) {
    clearCachedMonthlyInsight(monthKey, locale);
    const live = await generateLiveMonthlyInsight(locale);
    writeCachedMonthlyInsight(monthKey, locale, live);
    return live;
  }

  const cached = readCachedMonthlyInsight(monthKey, locale);
  if (cached) {
    return cached;
  }

  const local = await generateLocalMonthlyInsight(locale);
  writeCachedMonthlyInsight(monthKey, locale, local);
  return local;
}
