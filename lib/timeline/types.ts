/**
 * Living Timeline — continuously observe Giuseppe's life events.
 * Events refine the Digital Twin over time.
 */

export type TimelineEventSource =
  | 'linkedin'
  | 'medium'
  | 'visceral_poems'
  | 'urees'
  | 'giuseppe_os'
  | 'career'
  | 'relationship'
  | 'travel'
  | 'conversation'
  | 'instagram'
  | 'creative_work'
  | 'public_talk'
  | 'book'
  | 'lesson'
  | 'memory'
  | 'decision'
  | 'other';

export interface TimelineEvent {
  id: string;
  source: TimelineEventSource;
  title: string;
  observedAt: string;
  summary: string;
  url?: string;
}

export interface LivingTimelineReport {
  generatedAt: string;
  events: TimelineEvent[];
  note: string;
}
