import type { TodayActionKind } from '../today-action/types';

export type TodayPayload = {
  greeting: string;
  mindful_reflection: string;
  today_focus: string;
  next_action: string;
  risk_or_distraction: string;
  personal_insight: string;
  closing_line: string;
};

export type TodaySource = 'live' | 'mock' | 'fallback';

export type TodayResponse = {
  payload: TodayPayload;
  source: TodaySource;
  dateKey: string;
  generatedAt: string;
  cached: boolean;
  /** True when the UI should show an explicit fallback notice. */
  isFallback: boolean;
  actionKind?: TodayActionKind;
  actionTopic?: string;
};

export type TodayContext = {
  dateKey: string;
  generatedAt: string;
  promptBlock: string;
};

export type GenerateTodayOptions = {
  regenerate?: boolean;
};
