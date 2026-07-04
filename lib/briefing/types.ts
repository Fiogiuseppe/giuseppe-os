import type { PersonalRelevanceReport } from '../relevance/types';
import type { RealityReport } from '../reality/types';
import type { TrajectoryReport } from '../trajectory/types';

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
  trajectoryApproved: number;
  trajectoryFiltered: number;
  externalFeedsActive: number;
  confidenceNote: string;
  trajectoryNote: string;
  qualityPassed: boolean;
  qualityConfidence: 'high' | 'medium' | 'low';
  qualityNote: string;
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
  trajectory: TrajectoryReport;
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
