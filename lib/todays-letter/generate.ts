import { createClaudeProvider } from '../brain/providers/claude';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { buildTodaysLetterContext, formatContextForPrompt } from './buildContext';
import { readCachedLetter, writeCachedLetter } from './cache';
import { buildFallbackLetter } from './fallback';
import { assembleLetter, countWords, parseLetterSections } from './parse';
import { MAX_LETTER_WORDS, TODAYS_LETTER_SYSTEM_PROMPT } from './prompt';
import type { TodaysLetterResponse, TodaysLetterSections, TodaysLetterSource } from './types';

function normalizeSections(
  partial: Partial<TodaysLetterSections>,
  fallback: TodaysLetterSections
): TodaysLetterSections {
  return {
    greeting: partial.greeting?.trim() || fallback.greeting,
    observation: partial.observation?.trim() || fallback.observation,
    whyItMatters: partial.whyItMatters?.trim() || fallback.whyItMatters,
    recommendation: partial.recommendation?.trim() || fallback.recommendation,
    creativeSuggestion: partial.creativeSuggestion?.trim() || fallback.creativeSuggestion,
    reflectionQuestion: partial.reflectionQuestion?.trim() || fallback.reflectionQuestion
  };
}

function buildResponse(
  sections: TodaysLetterSections,
  source: TodaysLetterSource,
  generatedAt: string,
  dateKey: string,
  cached: boolean
): TodaysLetterResponse {
  const letter = assembleLetter(sections);
  return {
    letter,
    sections,
    wordCount: countWords(letter),
    source,
    generatedAt,
    dateKey,
    cached
  };
}

function useAnthropic(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

function resolveLetterMode(): 'anthropic' | 'fallback' {
  if (process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase() === 'rule-based') {
    return 'fallback';
  }
  if (useAnthropic()) {
    return 'anthropic';
  }
  throw new ProviderConfigurationError(
    'ANTHROPIC_API_KEY is required for Today\'s Letter.'
  );
}

export async function generateTodaysLetter(): Promise<TodaysLetterResponse> {
  const context = await buildTodaysLetterContext();
  const cached = await readCachedLetter(context.dateKey);
  if (cached) {
    return cached;
  }

  const fallbackSections = buildFallbackLetter(context);
  const mode = resolveLetterMode();

  if (mode === 'fallback') {
    const response = buildResponse(
      fallbackSections,
      'fallback',
      context.generatedAt,
      context.dateKey,
      false
    );
    await writeCachedLetter(context.dateKey, response);
    return response;
  }

  const userPrompt = [
    'Write Giuseppe his Today letter using only this context:',
    formatContextForPrompt(context)
  ].join('\n\n');

  const completion = await createClaudeProvider().complete({
    system: TODAYS_LETTER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 700,
    temperature: 0.35
  });

  const sections = normalizeSections(parseLetterSections(completion.content), fallbackSections);
  const response = buildResponse(sections, 'anthropic', context.generatedAt, context.dateKey, false);
  await writeCachedLetter(context.dateKey, response);
  return response;
}

export function mapTodaysLetterError(error: unknown): { status: number; message: string } {
  if (error instanceof ProviderConfigurationError) {
    return {
      status: 503,
      message:
        'Giuseppe OS non può scrivere la lettera di oggi. Aggiungi ANTHROPIC_API_KEY in .env.local.'
    };
  }

  if (error instanceof ProviderRequestError) {
    return { status: 502, message: 'La generazione della lettera non è riuscita. Riprova tra poco.' };
  }

  if (error instanceof Error) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: "Today's Letter failed." };
}
