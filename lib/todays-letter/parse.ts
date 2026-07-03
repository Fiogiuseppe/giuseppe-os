import type { TodaysLetterSections } from './types';

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

export function parseLetterSections(answer: string): Partial<TodaysLetterSections> {
  const cleaned = stripCodeFence(answer);

  try {
    const parsed = JSON.parse(cleaned) as Partial<TodaysLetterSections> & {
      recommendation?: string;
    };
    if (parsed && typeof parsed === 'object') {
      return {
        ...parsed,
        thingToFocusOn: parsed.thingToFocusOn ?? parsed.recommendation
      };
    }
  } catch {
    // Fall through to regex parsing.
  }

  const fields: Partial<TodaysLetterSections> = {};
  const pick = (pattern: RegExp) => answer.match(pattern)?.[1]?.trim();

  fields.greeting = pick(/greeting:\s*(.+)/i);
  fields.observation = pick(/observation:\s*(.+)/i) ?? pick(/one important observation:\s*(.+)/i);
  fields.whyItMatters =
    pick(/why (?:this )?matters:\s*(.+)/i) ?? pick(/why it matters(?: today)?:\s*(.+)/i);
  fields.thingToIgnore =
    pick(/thingToIgnore:\s*(.+)/i) ?? pick(/one thing you should ignore today:\s*(.+)/i);
  fields.thingToFocusOn =
    pick(/thingToFocusOn:\s*(.+)/i) ??
    pick(/one thing you should focus on:\s*(.+)/i) ??
    pick(/recommendation:\s*(.+)/i);
  fields.creativeSuggestion =
    pick(/creativeSuggestion:\s*(.+)/i) ?? pick(/one creative suggestion:\s*(.+)/i);
  fields.opportunity = pick(/opportunity:\s*(.+)/i) ?? pick(/one opportunity:\s*(.+)/i);
  fields.reflectionQuestion =
    pick(/reflectionQuestion:\s*(.+)/i) ?? pick(/one reflection question:\s*(.+)/i);

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
    sections.thingToIgnore,
    '',
    sections.thingToFocusOn,
    '',
    sections.creativeSuggestion,
    '',
    sections.opportunity,
    '',
    sections.reflectionQuestion
  ].join('\n');
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
