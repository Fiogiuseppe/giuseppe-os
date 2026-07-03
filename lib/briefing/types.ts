import type { PersonalRelevanceReport } from '../relevance/types';
import type { RealityReport } from '../reality/types';

export interface DailyBriefingSections {
  greeting: string;
  oneBigMove: string;
  reality: string;
  opportunity: string;
  ignore: string;
  nourish: string;
  reflection: string;
}

export type DailyBriefingSource = 'anthropic' | 'fallback';

export interface DailyBriefingPipelineMeta {
  realitySignals: number;
  relevanceItems: number;
  externalFeedsActive: number;
  confidenceNote: string;
}

export interface DailyBriefingContext {
  generatedAt: string;
  localDate: string;
  localTime: string;
  dayPart: 'morning' | 'afternoon' | 'evening' | 'night';
  dateKey: string;
  constitution: string;
  mission: string;
  northStar: string;
  values: string[];
  patterns: string[];
  creativeGoals: string[];
  careerGoals: string[];
  financeGoals: string[];
  learningGoals: string[];
  relationships: string[];
  activeProjects: Array<{ name: string; role: string; status: string }>;
  priorities: string[];
  reality: RealityReport;
  relevance: PersonalRelevanceReport;
}

export interface DailyBriefingResponse {
  briefing: string;
  /** @deprecated Use briefing — kept for API compatibility */
  letter: string;
  sections: DailyBriefingSections;
  wordCount: number;
  source: DailyBriefingSource;
  generatedAt: string;
  dateKey: string;
  cached: boolean;
  pipeline: DailyBriefingPipelineMeta;
}
