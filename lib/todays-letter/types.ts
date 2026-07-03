export interface TodaysLetterContext {
  generatedAt: string;
  localDate: string;
  localTime: string;
  dayPart: 'morning' | 'afternoon' | 'evening' | 'night';
  mission: string;
  northStar: string;
  manifesto: string;
  values: string[];
  rules: string[];
  activeProjects: Array<{ name: string; role: string; status: string }>;
  priorities: string[];
  patterns: string[];
  financialSummary: {
    liquidityTier: string;
    goals: string[];
  };
  recentDecisions: Array<{ decision: string; reason: string; timestamp: string }>;
}

export interface TodaysLetterSections {
  greeting: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  creativeSuggestion: string;
  reflectionQuestion: string;
}

export type TodaysLetterSource = 'ai' | 'fallback';

export interface TodaysLetterResponse {
  letter: string;
  sections: TodaysLetterSections;
  wordCount: number;
  source: TodaysLetterSource;
  generatedAt: string;
}
