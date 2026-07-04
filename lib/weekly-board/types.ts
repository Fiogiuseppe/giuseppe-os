export type WeeklyBoardSections = {
  priorities: string[];
  doNotDo: string[];
  challenge: string;
  trajectoryCheck: string;
};

export type WeeklyBoardSource = 'groq' | 'requesty' | 'gemini' | 'fallback' | 'mock';

export type WeeklyBoardPipelineMeta = {
  evidenceDecisions: number;
  evidenceOutcomes: number;
  evidencePatterns: number;
  thinEvidence: boolean;
  trajectoryNote: string;
};

export type WeeklyBoardResponse = WeeklyBoardSections & {
  source: WeeklyBoardSource;
  generatedAt: string;
  weekKey: string;
  cached: boolean;
  pipeline: WeeklyBoardPipelineMeta;
};

export type WeeklyBoardContext = {
  generatedAt: string;
  weekKey: string;
  weekLabel: string;
  locale: 'it' | 'en';
  northStar: string;
  mission: string;
  priorities: string[];
  patterns: string[];
  oracleEvidenceBlock: string;
  evidence: {
    decisions: number;
    outcomes: number;
    patterns: number;
    streaks: number;
  };
  thinEvidence: boolean;
};
