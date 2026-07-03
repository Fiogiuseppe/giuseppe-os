import type { PersonalRelevanceReport } from '../relevance/types';
import type { RealityReport } from '../reality/types';

export interface TodaysLetterContext {
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

export interface TodaysLetterSections {
  greeting: string;
  observation: string;
  whyItMatters: string;
  thingToIgnore: string;
  thingToFocusOn: string;
  creativeSuggestion: string;
  opportunity: string;
  reflectionQuestion: string;
}

export type TodaysLetterSource = 'anthropic' | 'fallback';

export interface TodaysLetterPipelineMeta {
  realitySignals: number;
  relevanceItems: number;
  externalFeedsActive: number;
  confidenceNote: string;
}

export interface TodaysLetterResponse {
  letter: string;
  sections: TodaysLetterSections;
  wordCount: number;
  source: TodaysLetterSource;
  generatedAt: string;
  dateKey: string;
  cached: boolean;
  pipeline: TodaysLetterPipelineMeta;
}
