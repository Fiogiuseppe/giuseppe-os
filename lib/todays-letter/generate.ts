import { resolveAIProvider } from '../brain/providers';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { buildTodaysLetterContext, formatContextForPrompt } from './buildContext';
import { buildFallbackLetter } from './fallback';
import { assembleLetter, countWords, parseLetterSections } from './parse';
import { TODAYS_LETTER_SYSTEM_PROMPT } from './prompt';
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
  generatedAt: string
): TodaysLetterResponse {
  const letter = assembleLetter(sections);
  return {
    letter,
    sections,
    wordCount: countWords(letter),
    source,
    generatedAt
  };
}

export async function generateTodaysLetter(): Promise<TodaysLetterResponse> {
  const context = await buildTodaysLetterContext();
  const fallbackSections = buildFallbackLetter(context);
  const provider = resolveAIProvider();

  if (provider.name === 'rule-based') {
    return buildResponse(fallbackSections, 'fallback', context.generatedAt);
  }

  const userPrompt = [
    'Write Giuseppe his Today letter using only this context:',
    formatContextForPrompt(context)
  ].join('\n\n');

  try {
    const completion = await provider.complete({
      system: TODAYS_LETTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 900,
      temperature: 0.5
    });

    const sections = normalizeSections(parseLetterSections(completion.content), fallbackSections);
    return buildResponse(sections, 'ai', context.generatedAt);
  } catch (error) {
    if (error instanceof ProviderConfigurationError) {
      return buildResponse(fallbackSections, 'fallback', context.generatedAt);
    }
    throw error;
  }
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
