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

export function parseWeeklyBoardResponse(answer: string): {
  priorities: string[];
  doNotDo: string[];
  challenge: string;
  trajectoryCheck: string;
} {
  const cleaned = stripCodeFence(answer);

  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      priorities: asStringArray(parsed.priorities, 3),
      doNotDo: asStringArray(parsed.doNotDo, 3),
      challenge: typeof parsed.challenge === 'string' ? parsed.challenge.trim() : '',
      trajectoryCheck:
        typeof parsed.trajectoryCheck === 'string' ? parsed.trajectoryCheck.trim() : ''
    };
  } catch {
    return {
      priorities: [],
      doNotDo: [],
      challenge: '',
      trajectoryCheck: ''
    };
  }
}

export function normalizeWeeklyBoardSections(
  partial: ReturnType<typeof parseWeeklyBoardResponse>,
  fallback: ReturnType<typeof parseWeeklyBoardResponse>
): ReturnType<typeof parseWeeklyBoardResponse> {
  return {
    priorities: partial.priorities.length > 0 ? partial.priorities : fallback.priorities,
    doNotDo: partial.doNotDo.length > 0 ? partial.doNotDo : fallback.doNotDo,
    challenge: partial.challenge || fallback.challenge,
    trajectoryCheck: partial.trajectoryCheck || fallback.trajectoryCheck
  };
}
