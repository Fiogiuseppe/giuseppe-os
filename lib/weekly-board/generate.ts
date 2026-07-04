import { isAIMockMode, isAILiveMode } from '../ai/mode';
import { runWithAICallMeta } from '../ai/callContext';
import { wrapProviderWithLogging } from '../ai/loggedProvider';
import { resolveAIProvider } from '../brain/providers';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { hasLiveAiCredentials } from '../ai/mode';
import { resolveLocale, pickLocale, type AppLocale } from '../i18n/locale';
import { WEEKLY_BOARD_SYSTEM_PROMPT } from '../oracle/weeklyPrompt';
import { mapBriefingError } from '../todays-letter/generate';
import { buildWeeklyBoardContext } from './buildContext';
import {
  clearCachedWeeklyBoard,
  readCachedWeeklyBoard,
  weeklyBoardWeekKey,
  writeCachedWeeklyBoard
} from './cache';
import { buildFallbackWeeklyBoard } from './fallback';
import { normalizeWeeklyBoardSections, parseWeeklyBoardResponse } from './parse';
import { persistWeeklyBoardToMemory } from './persist';
import type { WeeklyBoardContext, WeeklyBoardPipelineMeta, WeeklyBoardResponse } from './types';

export type GenerateWeeklyBoardOptions = {
  regenerate?: boolean;
};

function hasLiveAiKey(): boolean {
  return hasLiveAiCredentials();
}

function pipelineMeta(context: WeeklyBoardContext): WeeklyBoardPipelineMeta {
  return {
    evidenceDecisions: context.evidence.decisions,
    evidenceOutcomes: context.evidence.outcomes,
    evidencePatterns: context.evidence.patterns,
    thinEvidence: context.thinEvidence,
    trajectoryNote: context.thinEvidence
      ? 'Insufficient weekly evidence — honest fallback only.'
      : `${context.evidence.outcomes} reviewed outcomes in the last 7 days.`
  };
}

function buildResponse(
  sections: ReturnType<typeof normalizeWeeklyBoardSections>,
  source: WeeklyBoardResponse['source'],
  context: WeeklyBoardContext,
  cached: boolean
): WeeklyBoardResponse {
  return {
    ...sections,
    source,
    generatedAt: context.generatedAt,
    weekKey: context.weekKey,
    cached,
    pipeline: pipelineMeta(context)
  };
}

async function buildMockWeeklyBoard(context: WeeklyBoardContext): Promise<WeeklyBoardResponse> {
  const fallback = buildFallbackWeeklyBoard(context, context.locale);
  return buildResponse(fallback, 'mock', context, false);
}

async function buildLiveWeeklyBoard(context: WeeklyBoardContext): Promise<WeeklyBoardResponse> {
  const fallback = buildFallbackWeeklyBoard(context, context.locale);

  if (context.thinEvidence || !hasLiveAiKey()) {
    return buildResponse(fallback, 'fallback', context, false);
  }

  try {
    const userPrompt = [
      pickLocale(
        context.locale,
        'Prepara il Weekly Board di Giuseppe usando solo questo contesto evidenza:',
        'Prepare Giuseppe’s Weekly Board using only this evidence context:'
      ),
      pickLocale(
        context.locale,
        'Rispondi interamente in italiano.',
        'Respond entirely in English.'
      ),
      `NORTH STAR: ${context.northStar}`,
      `MISSION: ${context.mission}`,
      context.oracleEvidenceBlock
    ].join('\n\n');

    const provider = wrapProviderWithLogging(resolveAIProvider(), 'weekly-board');
    const completion = await provider.complete({
      system: WEEKLY_BOARD_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 900,
      temperature: 0.35
    });

    const parsed = normalizeWeeklyBoardSections(parseWeeklyBoardResponse(completion.content), fallback);
    const liveSource =
      provider.name === 'groq' || provider.name === 'gemini' || provider.name === 'requesty'
        ? provider.name
        : 'fallback';
    return buildResponse(parsed, liveSource, context, false);
  } catch (error) {
    if (!(error instanceof ProviderConfigurationError || error instanceof ProviderRequestError)) {
      throw error;
    }

    return buildResponse(fallback, 'fallback', context, false);
  }
}

async function generateWeeklyBoardFresh(
  locale: AppLocale = 'it',
  _options: GenerateWeeklyBoardOptions = {}
): Promise<WeeklyBoardResponse> {
  const context = await buildWeeklyBoardContext(locale);
  const response = isAIMockMode()
    ? await buildMockWeeklyBoard(context)
    : await buildLiveWeeklyBoard(context);

  writeCachedWeeklyBoard(context.weekKey, response, locale);
  await persistWeeklyBoardToMemory(response, context.weekKey);
  return response;
}

export async function generateWeeklyBoard(
  localeInput?: AppLocale,
  options: GenerateWeeklyBoardOptions = {}
): Promise<WeeklyBoardResponse> {
  const locale = resolveLocale(localeInput);
  const weekKey = weeklyBoardWeekKey();
  const regenerate = options.regenerate === true;

  if (regenerate && !isAILiveMode()) {
    const cached = readCachedWeeklyBoard(weekKey, locale);
    if (cached) {
      return cached;
    }
  }

  if (regenerate) {
    clearCachedWeeklyBoard(weekKey, locale);
  }

  if (!regenerate) {
    const cached = readCachedWeeklyBoard(weekKey, locale);
    if (cached) {
      return cached;
    }
  }

  return runWithAICallMeta(
    { page: 'today', reason: regenerate ? 'weekly-board-regenerate' : 'weekly-board' },
    () => generateWeeklyBoardFresh(locale, options)
  );
}

export { mapBriefingError as mapWeeklyBoardError };
