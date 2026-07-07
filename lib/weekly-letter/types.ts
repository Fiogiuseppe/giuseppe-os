export type WeeklyLetterSource = 'groq' | 'requesty' | 'gemini' | 'fallback' | 'mock';

export type WeeklyLetterEvidence = {
  decisions: number;
  outcomes: number;
  dailyBriefs: number;
  insights: number;
  projectUpdates: number;
  guardianReports: number;
  connectedSources: number;
  knowledgeItems: number;
  workingSessions: number;
  patterns: number;
};

export type WeeklyLetterContent = {
  openingSentence: string;
  noticed: string[];
  movedForward: string[];
  slowedDown: string[];
  opportunities: string[];
  managersAdvice: string;
  nextWeekActions: string[];
};

export type WeeklyLetterResponse = {
  weekKey: string;
  weekNumber: number;
  dateRange: string;
  weekLabel: string;
  content: WeeklyLetterContent;
  evidence: WeeklyLetterEvidence;
  source: WeeklyLetterSource;
  generatedAt: string;
  cached: boolean;
  thinEvidence: boolean;
};

export type WeeklyLetterContext = {
  generatedAt: string;
  weekKey: string;
  weekNumber: number;
  dateRange: string;
  weekLabel: string;
  locale: 'it' | 'en';
  northStar: string;
  mission: string;
  priorities: string[];
  patterns: string[];
  activeProjects: Array<{ name: string; role: string; status: string }>;
  evidenceBlock: string;
  evidence: WeeklyLetterEvidence;
  thinEvidence: boolean;
  guardianNote: string | null;
  selfModelSummary: string;
  connectedSourceLabels: string[];
};

export type StoredWeeklyLetter = WeeklyLetterResponse & {
  htmlBody: string;
  emailSentAt: string | null;
};
