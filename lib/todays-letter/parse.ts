import type { DailyBriefingSections } from '../briefing/types';

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function mapLegacyFields(
  parsed: Partial<DailyBriefingSections> & Record<string, string | undefined>
): Partial<DailyBriefingSections> {
  return {
    greeting: parsed.greeting,
    oneBigMove: parsed.oneBigMove ?? parsed.thingToFocusOn ?? parsed.recommendation,
    reality: parsed.reality ?? parsed.observation,
    opportunity: parsed.opportunity,
    ignore: parsed.ignore ?? parsed.thingToIgnore,
    nourish: parsed.nourish ?? parsed.creativeSuggestion,
    reflection: parsed.reflection ?? parsed.reflectionQuestion
  };
}

export function parseBriefingSections(answer: string): Partial<DailyBriefingSections> {
  const cleaned = stripCodeFence(answer);

  try {
    const parsed = JSON.parse(cleaned) as Partial<DailyBriefingSections> & Record<string, string | undefined>;
    if (parsed && typeof parsed === 'object') {
      return mapLegacyFields(parsed);
    }
  } catch {
    // Fall through to regex parsing.
  }

  const fields: Partial<DailyBriefingSections> = {};
  const pick = (pattern: RegExp) => answer.match(pattern)?.[1]?.trim();

  fields.greeting = pick(/greeting:\s*(.+)/i);
  fields.oneBigMove =
    pick(/oneBigMove:\s*(.+)/i) ??
    pick(/one big move:\s*(.+)/i) ??
    pick(/thingToFocusOn:\s*(.+)/i);
  fields.reality = pick(/reality:\s*(.+)/i) ?? pick(/observation:\s*(.+)/i);
  fields.opportunity = pick(/opportunity:\s*(.+)/i);
  fields.ignore = pick(/ignore:\s*(.+)/i) ?? pick(/thingToIgnore:\s*(.+)/i);
  fields.nourish = pick(/nourish:\s*(.+)/i) ?? pick(/creativeSuggestion:\s*(.+)/i);
  fields.reflection = pick(/reflection:\s*(.+)/i) ?? pick(/reflectionQuestion:\s*(.+)/i);

  return fields;
}

/** @deprecated Use parseBriefingSections */
export const parseLetterSections = parseBriefingSections;

export function assembleBriefing(sections: DailyBriefingSections): string {
  return [
    sections.greeting,
    '',
    sections.oneBigMove,
    '',
    sections.reality,
    '',
    sections.opportunity,
    '',
    sections.ignore,
    '',
    sections.nourish,
    '',
    sections.reflection
  ].join('\n');
}

/** @deprecated Use assembleBriefing */
export const assembleLetter = assembleBriefing;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
