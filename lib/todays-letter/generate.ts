import { isAIMockMode, isDevelopmentEnvironment } from '../ai/mode';
import { wrapProviderWithLogging } from '../ai/loggedProvider';
import { createClaudeProvider } from '../brain/providers/claude';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { resolveLocale, pickLocale, type AppLocale } from '../i18n/locale';
import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import type { DailyBriefingContext, DailyBriefingResponse, DailyBriefingSections } from '../briefing/types';
import {
  buildQualitySilenceBriefing,
  evaluateBriefingQuality,
  type BriefingQualityReport
} from '../briefing/quality';
import { applyTrajectoryToBriefing } from '../trajectory/briefingFilter';
import { buildDailyBriefingContext, formatContextForPrompt } from './buildContext';
import {
  readCachedLetter,
  letterDateKey,
  usePlatformLetterCache,
  writeCachedLetter,
  clearCachedLetter
} from './cache';
import { buildFallbackBriefing } from './fallback';
import { getPlatformCachedLetter } from './platformCache';
import { assembleBriefing, countWords, limitWords, parseBriefingSections } from './parse';
import { DAILY_BRIEFING_SYSTEM_PROMPT, MAX_BRIEFING_WORDS, MAX_TODAY_ONE_BIG_MOVE_WORDS } from './prompt';
import { validateOracleClaims } from '../oracle/validate';

export type GenerateDailyBriefingOptions = {
  regenerate?: boolean;
};

function clampOneBigMove(sections: DailyBriefingSections): DailyBriefingSections {
  return {
    ...sections,
    oneBigMove: limitWords(sections.oneBigMove, MAX_TODAY_ONE_BIG_MOVE_WORDS)
  };
}

function applyTodayMoveLimit(response: DailyBriefingResponse): DailyBriefingResponse {
  const sections = clampOneBigMove(response.sections);
  const briefing = assembleBriefing(sections);
  return {
    ...response,
    sections,
    briefing,
    letter: briefing,
    wordCount: countWords(briefing)
  };
}

function normalizeSections(
  partial: Partial<DailyBriefingSections>,
  fallback: DailyBriefingSections
): DailyBriefingSections {
  return clampOneBigMove({
    greeting: partial.greeting?.trim() || fallback.greeting,
    oneBigMove: partial.oneBigMove?.trim() || fallback.oneBigMove,
    reality: partial.reality?.trim() || fallback.reality,
    opportunity: partial.opportunity?.trim() || fallback.opportunity,
    ignore: partial.ignore?.trim() || fallback.ignore,
    nourish: partial.nourish?.trim() || fallback.nourish,
    reflection: partial.reflection?.trim() || fallback.reflection
  });
}

function pipelineMeta(context: DailyBriefingContext, quality: BriefingQualityReport) {
  return {
    realitySignals: context.reality.signals.length,
    relevanceItems: context.relevance.items.length,
    trajectoryApproved: context.trajectory.approvedCount,
    trajectoryFiltered: context.trajectory.filteredCount,
    externalFeedsActive: context.reality.externalFeedsActive,
    confidenceNote: context.relevance.confidenceNote,
    trajectoryNote: context.trajectory.trajectoryNote,
    qualityPassed: quality.shouldPublish,
    qualityConfidence: quality.confidence,
    qualityPersonalization: quality.personalization,
    qualityNote: quality.qualityNote
  };
}

function applyQualityGate(
  sections: DailyBriefingSections,
  context: DailyBriefingContext
): { sections: DailyBriefingSections; quality: BriefingQualityReport } {
  const quality = evaluateBriefingQuality(sections, context);
  if (quality.shouldPublish) {
    return { sections, quality };
  }
  return {
    sections: buildQualitySilenceBriefing(context),
    quality
  };
}

async function filterSectionsThroughTrajectory(
  sections: DailyBriefingSections,
  context: DailyBriefingContext
): Promise<DailyBriefingSections> {
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  return applyTrajectoryToBriefing(sections, context, brain, longTerm);
}

function buildResponse(
  sections: DailyBriefingSections,
  source: DailyBriefingResponse['source'],
  context: DailyBriefingContext,
  quality: BriefingQualityReport,
  cached: boolean
): DailyBriefingResponse {
  const limited = clampOneBigMove(sections);
  const briefing = assembleBriefing(limited);
  return {
    briefing,
    letter: briefing,
    sections: limited,
    wordCount: countWords(briefing),
    source,
    generatedAt: context.generatedAt,
    dateKey: context.dateKey,
    cached,
    pipeline: pipelineMeta(context, quality)
  };
}

function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

async function buildMockBriefing(
  context: DailyBriefingContext,
  locale: AppLocale
): Promise<DailyBriefingResponse> {
  const fallbackSections = buildFallbackBriefing(context, locale);
  const filtered = await filterSectionsThroughTrajectory(fallbackSections, context);
  const gated = applyQualityGate(filtered, context);
  return buildResponse(gated.sections, 'mock', context, gated.quality, false);
}

async function buildLiveBriefing(
  context: DailyBriefingContext,
  locale: AppLocale
): Promise<DailyBriefingResponse> {
  const fallbackSections = buildFallbackBriefing(context, locale);

  if (!hasAnthropicKey()) {
    const filtered = await filterSectionsThroughTrajectory(fallbackSections, context);
    const gated = applyQualityGate(filtered, context);
    return buildResponse(gated.sections, 'fallback', context, gated.quality, false);
  }

  try {
    const userPrompt = [
      pickLocale(
        locale,
        'Scrivi il Daily Briefing di Giuseppe usando solo questo contesto del pipeline di intelligence:',
        'Write Giuseppe his Daily Briefing using only this intelligence pipeline context:'
      ),
      pickLocale(
        locale,
        'Rispondi interamente in italiano.',
        'Respond entirely in English.'
      ),
      formatContextForPrompt(context)
    ].join('\n\n');

    const provider = wrapProviderWithLogging(createClaudeProvider(), 'todays-letter');
    const completion = await provider.complete({
      system: DAILY_BRIEFING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 1000,
      temperature: 0.35
    });

    const parsed = normalizeSections(parseBriefingSections(completion.content), fallbackSections);
    validateOracleClaims(parsed, context.oracle);

    const filtered = await filterSectionsThroughTrajectory(parsed, context);
    const gated = applyQualityGate(filtered, context);
    return buildResponse(gated.sections, 'anthropic', context, gated.quality, false);
  } catch (error) {
    if (!(error instanceof ProviderConfigurationError || error instanceof ProviderRequestError)) {
      throw error;
    }

    const filtered = await filterSectionsThroughTrajectory(fallbackSections, context);
    const gated = applyQualityGate(filtered, context);
    return buildResponse(gated.sections, 'fallback', context, gated.quality, false);
  }
}

async function generateDailyBriefingFresh(
  locale: AppLocale = 'it',
  options: GenerateDailyBriefingOptions = {}
): Promise<DailyBriefingResponse> {
  const context = await buildDailyBriefingContext();

  const response = isAIMockMode()
    ? await buildMockBriefing(context, locale)
    : await buildLiveBriefing(context, locale);

  writeCachedLetter(context.dateKey, response, locale);
  return response;
}

export async function generateDailyBriefing(
  localeInput?: AppLocale,
  options: GenerateDailyBriefingOptions = {}
): Promise<DailyBriefingResponse> {
  const locale = resolveLocale(localeInput);
  const dateKey = letterDateKey();
  const regenerate = options.regenerate === true;

  if (regenerate) {
    clearCachedLetter(dateKey, locale);
  }

  if (!regenerate) {
    const fileCached = await readCachedLetter(dateKey, locale);
    if (fileCached) {
      return applyTodayMoveLimit(fileCached);
    }
  }

  if (isDevelopmentEnvironment() && !regenerate) {
    return applyTodayMoveLimit(await generateDailyBriefingFresh(locale, options));
  }

  if (usePlatformLetterCache() && !regenerate) {
    return getPlatformCachedLetter(dateKey, locale, () => generateDailyBriefingFresh(locale, options));
  }

  return generateDailyBriefingFresh(locale, options);
}

/** @deprecated Use generateDailyBriefing */
export const generateTodaysLetter = generateDailyBriefing;

export function mapBriefingError(error: unknown): { status: number; message: string } {
  if (error instanceof ProviderConfigurationError) {
    return {
      status: 503,
      message:
        'Giuseppe OS non può preparare il briefing di oggi. Verifica ANTHROPIC_API_KEY e AI_MODE=live sul server.'
    };
  }

  if (error instanceof ProviderRequestError) {
    if (/credit balance|billing|purchase credits/i.test(error.message)) {
      return {
        status: 502,
        message:
          'Il servizio AI non è disponibile al momento. Giuseppe OS mostra il briefing locale.'
      };
    }

    return { status: 502, message: 'La generazione del briefing non è riuscita. Riprova tra poco.' };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: 'Daily Briefing failed.' };
}

/** @deprecated Use mapBriefingError */
export const mapTodaysLetterError = mapBriefingError;

export { MAX_BRIEFING_WORDS };
