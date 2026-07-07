function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function asStringArray(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim())
    .slice(0, maxItems);
}

export function parseWeeklyLetterResponse(answer: string): {
  openingSentence: string;
  noticed: string[];
  movedForward: string[];
  slowedDown: string[];
  opportunities: string[];
  managersAdvice: string;
  nextWeekActions: string[];
} {
  const cleaned = stripCodeFence(answer);

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      openingSentence: typeof parsed.openingSentence === 'string' ? parsed.openingSentence.trim() : '',
      noticed: asStringArray(parsed.noticed, 3),
      movedForward: asStringArray(parsed.movedForward, 3),
      slowedDown: asStringArray(parsed.slowedDown, 3),
      opportunities: asStringArray(parsed.opportunities, 3),
      managersAdvice: typeof parsed.managersAdvice === 'string' ? parsed.managersAdvice.trim() : '',
      nextWeekActions: asStringArray(parsed.nextWeekActions, 3)
    };
  } catch {
    return {
      openingSentence: '',
      noticed: [],
      movedForward: [],
      slowedDown: [],
      opportunities: [],
      managersAdvice: '',
      nextWeekActions: []
    };
  }
}

export function normalizeWeeklyLetterContent(
  partial: ReturnType<typeof parseWeeklyLetterResponse>,
  fallback: ReturnType<typeof parseWeeklyLetterResponse>
): ReturnType<typeof parseWeeklyLetterResponse> {
  return {
    openingSentence: partial.openingSentence || fallback.openingSentence,
    noticed: partial.noticed.length > 0 ? partial.noticed : fallback.noticed,
    movedForward: partial.movedForward.length > 0 ? partial.movedForward : fallback.movedForward,
    slowedDown: partial.slowedDown.length > 0 ? partial.slowedDown : fallback.slowedDown,
    opportunities: partial.opportunities.length > 0 ? partial.opportunities : fallback.opportunities,
    managersAdvice: partial.managersAdvice || fallback.managersAdvice,
    nextWeekActions:
      partial.nextWeekActions.length >= 3
        ? partial.nextWeekActions.slice(0, 3)
        : fallback.nextWeekActions.slice(0, 3)
  };
}
