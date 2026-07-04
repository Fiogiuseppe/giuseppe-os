import type { TodayPayload } from './types';

const REQUIRED_KEYS: (keyof TodayPayload)[] = [
  'greeting',
  'mindful_reflection',
  'today_focus',
  'next_action',
  'risk_or_distraction',
  'personal_insight',
  'closing_line'
];

export function limitWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(' ');
  }
  return `${words.slice(0, maxWords).join(' ')}…`;
}

export function parseTodayPayload(raw: unknown): Partial<TodayPayload> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const parsed: Partial<TodayPayload> = {};

  for (const key of REQUIRED_KEYS) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      parsed[key] = value.trim();
    }
  }

  return parsed;
}

export function normalizeTodayPayload(
  partial: Partial<TodayPayload>,
  fallback: TodayPayload
): TodayPayload {
  return {
    greeting: partial.greeting?.trim() || fallback.greeting,
    mindful_reflection: partial.mindful_reflection?.trim() || fallback.mindful_reflection,
    today_focus: partial.today_focus?.trim() || fallback.today_focus,
    next_action: partial.next_action?.trim() || fallback.next_action,
    risk_or_distraction: partial.risk_or_distraction?.trim() || fallback.risk_or_distraction,
    personal_insight: partial.personal_insight?.trim() || fallback.personal_insight,
    closing_line: partial.closing_line?.trim() || fallback.closing_line
  };
}
