export type {
  DailyBriefingContext,
  DailyBriefingPipelineMeta,
  DailyBriefingResponse,
  DailyBriefingSections,
  DailyBriefingSource
} from '../briefing/types';

/** @deprecated Use DailyBriefingContext */
export type TodaysLetterContext = import('../briefing/types').DailyBriefingContext;

/** @deprecated Use DailyBriefingSections */
export type TodaysLetterSections = import('../briefing/types').DailyBriefingSections;

/** @deprecated Use DailyBriefingSource */
export type TodaysLetterSource = import('../briefing/types').DailyBriefingSource;

/** @deprecated Use DailyBriefingPipelineMeta */
export type TodaysLetterPipelineMeta = import('../briefing/types').DailyBriefingPipelineMeta;

/** @deprecated Use DailyBriefingResponse */
export type TodaysLetterResponse = import('../briefing/types').DailyBriefingResponse;
