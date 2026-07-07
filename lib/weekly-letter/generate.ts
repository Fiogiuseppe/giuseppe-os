import { isAIMockMode, isAILiveMode, hasLiveAiCredentials } from '../ai/mode';
import { runWithAICallMeta } from '../ai/callContext';
import { wrapProviderWithLogging } from '../ai/loggedProvider';
import { completeWithJsonContract, JsonContractError } from '../ai/jsonCompletion';
import { resolveAIProvider } from '../brain/providers';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { resolveLocale, pickLocale, type AppLocale } from '../i18n/locale';
import { mapBriefingError } from '../todays-letter/generate';
import { buildWeeklyLetterContext } from './buildContext';
import {
  readCachedWeeklyLetter,
  toStoredWeeklyLetter,
  writeCachedWeeklyLetter
} from './cache';
import { buildFallbackWeeklyLetter } from './fallback';
import { normalizeWeeklyLetterContent, parseWeeklyLetterResponse } from './parse';
import { WEEKLY_LETTER_SYSTEM_PROMPT } from './prompt';
import { renderWeeklyLetterEmail } from './renderEmail';
import {
  isWeeklyLetterStoreConfigured,
  loadWeeklyLetterFromSupabase,
  saveWeeklyLetterToSupabase
} from './supabase';
import type { StoredWeeklyLetter, WeeklyLetterContent, WeeklyLetterResponse } from './types';
import { weeklyLetterWeekKey } from './week';

export type GenerateWeeklyLetterOptions = {
  regenerate?: boolean;
};

function buildResponse(
  content: WeeklyLetterContent,
  source: WeeklyLetterResponse['source'],
  context: Awaited<ReturnType<typeof buildWeeklyLetterContext>>,
  cached: boolean
): WeeklyLetterResponse {
  return {
    weekKey: context.weekKey,
    weekNumber: context.weekNumber,
    dateRange: context.dateRange,
    weekLabel: context.weekLabel,
    content,
    evidence: context.evidence,
    source,
    generatedAt: context.generatedAt,
    cached,
    thinEvidence: context.thinEvidence
  };
}

async function buildMockWeeklyLetter(
  context: Awaited<ReturnType<typeof buildWeeklyLetterContext>>
): Promise<WeeklyLetterResponse> {
  const fallback = buildFallbackWeeklyLetter(context);
  return buildResponse(fallback, 'mock', context, false);
}

async function buildLiveWeeklyLetter(
  context: Awaited<ReturnType<typeof buildWeeklyLetterContext>>,
  locale: AppLocale
): Promise<WeeklyLetterResponse> {
  const fallback = buildFallbackWeeklyLetter(context);

  if (context.thinEvidence || !hasLiveAiCredentials()) {
    return buildResponse(fallback, 'fallback', context, false);
  }

  try {
    const userPrompt = [
      pickLocale(
        locale,
        'Scrivi la Weekly Letter di Giuseppe usando solo questo contesto evidenza:',
        'Write Giuseppe\'s Weekly Letter using only this evidence context:'
      ),
      pickLocale(
        locale,
        'Rispondi interamente in italiano.',
        'Respond entirely in English.'
      ),
      `NORTH STAR: ${context.northStar}`,
      `MISSION: ${context.mission}`,
      context.evidenceBlock
    ].join('\n\n');

    const provider = wrapProviderWithLogging(resolveAIProvider(), 'weekly-letter');
    const completion = await completeWithJsonContract(provider, {
      system: WEEKLY_LETTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 1100,
      expectJson: true
    });

    const parsed = normalizeWeeklyLetterContent(parseWeeklyLetterResponse(completion.content), fallback);
    const liveSource =
      provider.name === 'groq' || provider.name === 'gemini' || provider.name === 'requesty'
        ? provider.name
        : 'fallback';
    return buildResponse(parsed, liveSource, context, false);
  } catch (error) {
    if (error instanceof JsonContractError) {
      throw error;
    }

    if (!(error instanceof ProviderConfigurationError || error instanceof ProviderRequestError)) {
      throw error;
    }

    return buildResponse(fallback, 'fallback', context, false);
  }
}

async function generateWeeklyLetterFresh(
  locale: AppLocale = 'en',
  _options: GenerateWeeklyLetterOptions = {}
): Promise<StoredWeeklyLetter> {
  const context = await buildWeeklyLetterContext(locale);
  const response = isAIMockMode()
    ? await buildMockWeeklyLetter(context)
    : await buildLiveWeeklyLetter(context, locale);

  const htmlBody = renderWeeklyLetterEmail(response);
  const stored = toStoredWeeklyLetter(response, htmlBody);
  writeCachedWeeklyLetter(stored);

  if (isWeeklyLetterStoreConfigured()) {
    await saveWeeklyLetterToSupabase(response, htmlBody);
  }

  return stored;
}

export async function generateWeeklyLetter(
  localeInput?: AppLocale,
  options: GenerateWeeklyLetterOptions = {}
): Promise<StoredWeeklyLetter> {
  const locale = resolveLocale(localeInput);
  const weekKey = weeklyLetterWeekKey();
  const regenerate = options.regenerate === true;

  if (regenerate && !isAILiveMode()) {
    const cached = readCachedWeeklyLetter(weekKey);
    if (cached) {
      return cached;
    }
  }

  if (!regenerate) {
    const memoryCached = readCachedWeeklyLetter(weekKey);
    if (memoryCached) {
      return memoryCached;
    }

    if (isWeeklyLetterStoreConfigured()) {
      const supabaseCached = await loadWeeklyLetterFromSupabase(weekKey);
      if (supabaseCached) {
        writeCachedWeeklyLetter(supabaseCached);
        return supabaseCached;
      }
    }
  }

  return runWithAICallMeta(
    { page: 'today', reason: regenerate ? 'weekly-letter-regenerate' : 'weekly-letter' },
    () => generateWeeklyLetterFresh(locale, options)
  );
}

export { mapBriefingError as mapWeeklyLetterError };
