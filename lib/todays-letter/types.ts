export interface TodaysLetterContext {
  generatedAt: string;
  localDate: string;
  localTime: string;
  dayPart: 'morning' | 'afternoon' | 'evening' | 'night';
  dateKey: string;
  constitution: string;
  mission: string;
  northStar: string;
  activeProjects: Array<{ name: string; role: string; status: string }>;
  priorities: string[];
}

export interface TodaysLetterSections {
  greeting: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  creativeSuggestion: string;
  reflectionQuestion: string;
}

export type TodaysLetterSource = 'anthropic' | 'fallback';

export interface TodaysLetterResponse {
  letter: string;
  sections: TodaysLetterSections;
  wordCount: number;
  source: TodaysLetterSource;
  generatedAt: string;
  dateKey: string;
  cached: boolean;
}
