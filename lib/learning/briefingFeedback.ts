import type { DailyBriefingSections } from '../briefing/types';

export type BriefingFeedbackRating = 'helpful' | 'neutral' | 'not_helpful';

export interface BriefingFeedbackEntry {
  id: string;
  dateKey: string;
  rating: BriefingFeedbackRating;
  section?: keyof DailyBriefingSections;
  note?: string;
  createdAt: string;
}

export const BRIEFING_FEEDBACK_RATINGS: BriefingFeedbackRating[] = [
  'helpful',
  'neutral',
  'not_helpful'
];

/** Learning Engine consumes this later — not wired to UI yet. */
export function summarizeBriefingFeedback(entries: BriefingFeedbackEntry[]): string {
  if (entries.length === 0) {
    return 'No briefing feedback recorded yet.';
  }

  const helpful = entries.filter(entry => entry.rating === 'helpful').length;
  const notHelpful = entries.filter(entry => entry.rating === 'not_helpful').length;

  return `${helpful} helpful, ${notHelpful} not helpful across ${entries.length} ratings.`;
}
