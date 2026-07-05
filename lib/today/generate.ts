import { createCompletionProvider } from '../ai/completionAdapter';
import { runWithAICallMeta } from '../ai/callContext';
import { completeWithJsonContract, JsonContractError } from '../ai/jsonCompletion';
import { hasLiveAiCredentials, isAILiveMode, isAIMockMode } from '../ai/mode';
import { wrapProviderWithLogging } from '../ai/loggedProvider';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { pickLocale, resolveLocale, type AppLocale } from '../i18n/locale';
import { inferTodayActionKind } from '../today-action/infer';
import { buildTodayContext } from './buildContext';
import {
  clearCachedToday,
  readCachedToday,
  todayDateKey,
  usePlatformTodayCache,
  writeCachedToday
} from './cache';
import { buildFallbackTodayPayload } from './fallback';
import { getPlatformCachedToday } from './platformCache';
import { limitWords, normalizeTodayPayload, parseTodayPayload } from './parse';
import { buildTodaySystemPrompt, MAX_TODAY_NEXT_ACTION_WORDS } from './prompt';
import type { GenerateTodayOptions, TodayResponse, TodaySource } from './types';

function clampNextAction(response: TodayResponse): TodayResponse {
  return {
    ...response,
    payload: {
      ...response.payload,
      next_action: limitWords(response.payload.next_action, MAX_TODAY_NEXT_ACTION_WORDS)
    }
  };
}

function attachActionMeta(response: TodayResponse): TodayResponse {
  const nextAction = response.payload.next_action;
  return {
    ...response,
    actionKind: response.actionKind ?? inferTodayActionKind(nextAction),
    actionTopic: response.actionTopic ?? nextAction
  };
}

function buildTodayResponse(
  payload: TodayResponse['payload'],
  source: TodaySource,
  context: Awaited<ReturnType<typeof buildTodayContext>>,
  cached: boolean
): TodayResponse {
  const isFallback = source === 'fallback' || source === 'mock';
  return attachActionMeta(
    clampNextAction({
      payload,
      source,
      dateKey: context.dateKey,
      generatedAt: context.generatedAt,
      cached,
      isFallback
    })
  );
}

async function buildMockToday(context: Awaited<ReturnType<typeof buildTodayContext>>, locale: AppLocale) {
  const payload = await buildFallbackTodayPayload(context, locale);
  return buildTodayResponse(payload, 'mock', context, false);
}

async function buildLiveToday(context: Awaited<ReturnType<typeof buildTodayContext>>, locale: AppLocale) {
  const fallbackPayload = await buildFallbackTodayPayload(context, locale);

  if (!hasLiveAiCredentials()) {
    return buildTodayResponse(fallbackPayload, 'fallback', context, false);
  }

  try {
    const userPrompt = [
      pickLocale(
        locale,
        'Genera l\'esperienza Today di Giuseppe usando solo questo contesto:',
        'Generate Giuseppe\'s Today experience using only this context:'
      ),
      pickLocale(locale, 'Rispondi interamente in italiano.', 'Respond entirely in English.'),
      context.promptBlock
    ].join('\n\n');

    const provider = wrapProviderWithLogging(createCompletionProvider(), 'today');
    const completion = await completeWithJsonContract(provider, {
      system: buildTodaySystemPrompt(locale),
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 900,
      expectJson: true
    });

    const parsed = normalizeTodayPayload(parseTodayPayload(completion.parsed), fallbackPayload);
    const source: TodaySource =
      provider.name === 'groq' || provider.name === 'gemini' || provider.name === 'requesty'
        ? 'live'
        : 'fallback';

    return buildTodayResponse(parsed, source, context, false);
  } catch (error) {
    if (error instanceof JsonContractError) {
      throw error;
    }

    if (!(error instanceof ProviderConfigurationError || error instanceof ProviderRequestError)) {
      throw error;
    }

    return buildTodayResponse(fallbackPayload, 'fallback', context, false);
  }
}

async function generateTodayFresh(
  locale: AppLocale = 'it',
  _options: GenerateTodayOptions = {}
): Promise<TodayResponse> {
  const context = await buildTodayContext();
  const response = isAIMockMode()
    ? await buildMockToday(context, locale)
    : await buildLiveToday(context, locale);

  writeCachedToday(context.dateKey, response, locale);
  return response;
}

export async function generateTodayExperience(
  localeInput?: AppLocale,
  options: GenerateTodayOptions = {}
): Promise<TodayResponse> {
  const locale = resolveLocale(localeInput);
  const dateKey = todayDateKey();
  const regenerate = options.regenerate === true;

  if (regenerate && !isAILiveMode()) {
    const cached = readCachedToday(dateKey, locale);
    if (cached) {
      return clampNextAction(cached);
    }
  }

  if (regenerate) {
    clearCachedToday(dateKey, locale);
  }

  if (!regenerate) {
    const cached = readCachedToday(dateKey, locale);
    if (cached) {
      return clampNextAction(cached);
    }
  }

  if (usePlatformTodayCache() && !regenerate) {
    return getPlatformCachedToday(dateKey, locale, () => generateTodayFresh(locale, options));
  }

  return runWithAICallMeta({ page: 'today', reason: regenerate ? 'regenerate' : 'today-engine' }, () =>
    generateTodayFresh(locale, options)
  );
}

export function mapTodayError(error: unknown): { status: number; message: string } {
  if (error instanceof JsonContractError) {
    return {
      status: 502,
      message:
        'Il Today Engine ha restituito JSON non valido. Giuseppe OS userà il fallback locale.'
    };
  }

  if (error instanceof ProviderConfigurationError) {
    return {
      status: 503,
      message: 'Giuseppe OS non può preparare Today. Verifica la configurazione AI sul server.'
    };
  }

  if (error instanceof ProviderRequestError) {
    return {
      status: 502,
      message: 'La generazione Today non è riuscita. Giuseppe OS userà il fallback locale.'
    };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: 'Today Engine failed.' };
}
