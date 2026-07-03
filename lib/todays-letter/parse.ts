import type { TodaysLetterSections } from './types';

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

export function parseLetterSections(answer: string): Partial<TodaysLetterSections> {
  const cleaned = stripCodeFence(answer);

  try {
    const parsed = JSON.parse(cleaned) as Partial<TodaysLetterSections>;
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // Fall through to regex parsing.
  }

  const fields: Partial<TodaysLetterSections> = {};
  const pick = (pattern: RegExp) => answer.match(pattern)?.[1]?.trim();

  fields.greeting = pick(/greeting:\s*(.+)/i);
  fields.observation = pick(/observation:\s*(.+)/i) ?? pick(/one important observation:\s*(.+)/i);
  fields.whyItMatters = pick(/why it matters(?: today)?:\s*(.+)/i);
  fields.recommendation =
    pick(/recommendation:\s*(.+)/i) ??
    pick(/one concrete action:\s*(.+)/i) ??
    pick(/one concrete recommendation:\s*(.+)/i);
  fields.creativeSuggestion =
    pick(/creative suggestion:\s*(.+)/i) ?? pick(/one creative suggestion:\s*(.+)/i);
  fields.reflectionQuestion =
    pick(/reflection question:\s*(.+)/i) ?? pick(/one reflection question:\s*(.+)/i);

  return fields;
}

export function assembleLetter(sections: TodaysLetterSections): string {
  return [
    sections.greeting,
    '',
    sections.observation,
    '',
    sections.whyItMatters,
    '',
    sections.recommendation,
    '',
    sections.creativeSuggestion,
    '',
    sections.reflectionQuestion
  ].join('\n');
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
