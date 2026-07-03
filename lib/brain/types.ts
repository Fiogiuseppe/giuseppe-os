export type BrainIntent = 'query' | 'decide' | 'reflect';

export type SourceType = 'identity' | 'user' | 'memory' | 'inference' | 'session';

export type Reliability = 'high' | 'medium' | 'low';

export interface ContextSource {
  field: string;
  sourceType: SourceType;
  reliability: Reliability;
  observedAt: string;
}

export interface BrainProject {
  role: string;
  status: string;
}

export interface GiuseppeBrain {
  north_star: string;
  mission_2036: string;
  manifesto: string;
  values: string[];
  rules: string[];
  projects: Record<string, BrainProject>;
  finance: {
    cash_dkk: number;
    liquidity_tier?: string;
    monthly_income_notes: string;
    main_goals: string[];
  };
  patterns: string[];
  skills: string[];
  priorities: string[];
  creative_goals: string[];
  career_goals: string[];
  reading_queue: string[];
  contacts: string[];
}

export interface WorkingMemorySession {
  id: string;
  timestamp: string;
  intent: BrainIntent;
  summary: string;
  query: string;
}

export interface WorkingMemory {
  sessions: WorkingMemorySession[];
  notes: string[];
}

export interface BrainRequest {
  intent: BrainIntent;
  message: string;
  decision?: string;
  reason?: string;
}

export interface ContextPacket {
  intent: BrainIntent;
  assembledAt: string;
  systemPrompt: string;
  userPrompt: string;
  sources: ContextSource[];
  lowContext: boolean;
  identity: {
    northStar: string;
    mission2036: string;
    manifesto: string;
    values: string[];
  };
  situational: {
    activeProjects: string[];
    priorities: string[];
    patterns: string[];
  };
}

export interface BrainResponse {
  intent: BrainIntent;
  answer: string;
  nextAction?: string;
  confidence: number;
  sources: ContextSource[];
  memoryUpdated: boolean;
  timestamp: string;
}

export interface MemoryUpdateResult {
  updated: boolean;
  sessionId?: string;
}
