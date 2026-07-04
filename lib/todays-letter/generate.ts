import { createClaudeProvider } from '../brain/providers/claude';
import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import type { DailyBriefingContext, DailyBriefingResponse, DailyBriefingSections } from '../briefing/types';
import {
  buildQualitySilenceBriefing,
  evaluateBriefingQuality,
  type BriefingQualityReport
} from '../briefing/quality';
import { applyTrajectoryToBriefing } from '../trajectory/briefingFilter';
import { buildDailyBriefingContext, formatContextForPrompt } from './buildContext';
import { readCachedLetter, letterDateKey, usePlatformLetterCache, writeCachedLetter } from './cache';
import { buildFallbackBriefing } from './fallback';
import { getPlatformCachedLetter } from './platformCache';
import { assembleBriefing, countWords, parseBriefingSections } from './parse';
import { DAILY_BRIEFING_SYSTEM_PROMPT, MAX_BRIEFING_WORDS } from './prompt';

function normalizeSections(
  partial: Partial<DailyBriefingSections>,
  fallback: DailyBriefingSections
): DailyBriefingSections {
  return {
    greeting: partial.greeting?.trim() || fallback.greeting,
    oneBigMove: partial.oneBigMove?.trim() || fallback.oneBigMove,
    reality: partial.reality?.trim() || fallback.reality,
    opportunity: partial.opportunity?.trim() || fallback.opportunity,
    ignore: partial.ignore?.trim() || fallback.ignore,
    nourish: partial.nourish?.trim() || fallback.nourish,
    reflection: partial.reflection?.trim() || fallback.reflection
  };
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
  const briefing = assembleBriefing(sections);
  return {
    briefing,
    letter: briefing,
    sections,
    wordCount: countWords(briefing),
    source,
    generatedAt: context.generatedAt,
    dateKey: context.dateKey,
    cached,
    pipeline: pipelineMeta(context, quality)
  };
}

function useAnthropic(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function resolveBriefingMode(): 'anthropic' | 'fallback' {
  if (process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase() === 'rule-based') {
    return 'fallback';
  }
  if (useAnthropic()) {
    return 'anthropic';
  }
  throw new ProviderConfigurationError(
    'ANTHROPIC_API_KEY is required for the Daily Briefing.'
  );
}

async function generateDailyBriefingFresh(): Promise<DailyBriefingResponse> {
  const context = await buildDailyBriefingContext();
  const fallbackSections = buildFallbackBriefing(context);
  const mode = resolveBriefingMode();

  let response: DailyBriefingResponse;

  if (mode === 'fallback') {
    const filtered = await filterSectionsThroughTrajectory(fallbackSections, context);
    const gated = applyQualityGate(filtered, context);
    response = buildResponse(gated.sections, 'fallback', context, gated.quality, false);
  } else {
    const userPrompt = [
      'Write Giuseppe his Daily Briefing using only this intelligence pipeline context:',
      formatContextForPrompt(context)
    ].join('\n\n');

    const completion = await createClaudeProvider().complete({
      system: DAILY_BRIEFING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 1000,
      temperature: 0.35
    });

    const filtered = await filterSectionsThroughTrajectory(
      normalizeSections(parseBriefingSections(completion.content), fallbackSections),
      context
    );
    const gated = applyQualityGate(filtered, context);
    response = buildResponse(gated.sections, 'anthropic', context, gated.quality, false);
  }

  await writeCachedLetter(context.dateKey, response);
  return response;
}

export async function generateDailyBriefing(): Promise<DailyBriefingResponse> {
  const dateKey = letterDateKey();
  const fileCached = await readCachedLetter(dateKey);
  if (fileCached) {
    return fileCached;
  }

  if (usePlatformLetterCache()) {
    return getPlatformCachedLetter(dateKey, generateDailyBriefingFresh);
  }

  return generateDailyBriefingFresh();
}

/** @deprecated Use generateDailyBriefing */
export const generateTodaysLetter = generateDailyBriefing;

export function mapBriefingError(error: unknown): { status: number; message: string } {
  if (error instanceof ProviderConfigurationError) {
    return {
      status: 503,
      message:
        'Giuseppe OS non può preparare il briefing di oggi. Aggiungi ANTHROPIC_API_KEY in .env.local.'
    };
  }

  if (error instanceof ProviderRequestError) {
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
