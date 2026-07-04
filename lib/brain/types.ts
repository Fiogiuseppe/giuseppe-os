export type BrainIntent =
  | 'auto'
  | 'query'
  | 'decide'
  | 'reflect'
  | 'awareness'
  | 'potential'
  | 'learn';

export type SourceType =
  | 'identity'
  | 'user'
  | 'memory'
  | 'inference'
  | 'session'
  | 'reality'
  | 'assumption';

export type Reliability = 'high' | 'medium' | 'low' | 'stale';

export type MemoryRecordType =
  | 'identity'
  | 'goals'
  | 'project'
  | 'lesson'
  | 'decision'
  | 'pattern'
  | 'relationship'
  | 'finance'
  | 'preference'
  | 'timeline';

export type ContextTopic =
  | 'identity'
  | 'finance'
  | 'freedom'
  | 'travel'
  | 'creative'
  | 'reputation'
  | 'projects'
  | 'learning'
  | 'relationships'
  | 'patterns';

export type AwarenessSignalType = 'pattern' | 'contradiction' | 'opportunity' | 'risk';

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

export interface MemoryRecord {
  id: string;
  type: MemoryRecordType;
  content: string;
  createdAt: string;
  confidence: number;
  source: 'interaction' | 'learning' | 'user';
}

export interface WorkingMemory {
  sessions: WorkingMemorySession[];
  notes: string[];
  records: MemoryRecord[];
}

export interface LongTermMemory {
  decisions: Array<{
    id: string;
    decision: string;
    reason: string;
    category?: string;
    timestamp: string;
    status?: import('../decision-learning/types').DecisionStatus;
    recommendation?: string;
    nextAction?: string;
    reviewAfter?: string;
    reviewCompletedAt?: string;
    takenAt?: string;
    outcome?: string;
    outcomeRating?: number | null;
    lesson?: string;
    trajectoryEffect?: import('../decision-learning/types').TrajectoryEffect;
    confidenceBefore?: number | null;
    confidenceAfter?: number | null;
  }>;
  lessons: Array<{
    id: string;
    lesson: string;
    source: string;
    timestamp: string;
  }>;
  patterns_detected: string[];
  insight_history?: Array<{
    id: string;
    insightId: string;
    insight: string;
    signalType: string;
    evidenceScore: number;
    timestamp: string;
  }>;
}

export interface BrainRequest {
  intent: BrainIntent;
  message: string;
  decision?: string;
  reason?: string;
  /** When false, skip durable memory persistence (default: true). */
  persist?: boolean;
  locale?: 'it' | 'en';
}

export interface ContextSlice {
  id: string;
  topic: ContextTopic;
  label: string;
  content: string;
}

export interface ContextPacket {
  intent: BrainIntent;
  locale: 'it' | 'en';
  assembledAt: string;
  systemPrompt: string;
  userPrompt: string;
  sources: ContextSource[];
  slices: ContextSlice[];
  topics: ContextTopic[];
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

export interface LessonInsight {
  lesson: string;
  evidence: string[];
  confidence: number;
}

export interface GrowthOpportunity {
  title: string;
  reason: string;
  firstAction: string;
}

export interface LearningReport {
  patterns: string[];
  mistakes: string[];
  evolvingPriorities: string[];
  inconsistencies: string[];
  abandonedProjects: string[];
  lessons: LessonInsight[];
  growthOpportunities: GrowthOpportunity[];
  analyzedAt: string;
}

export interface EngineOutputs {
  enginesUsed: string[];
  decision?: import('../../engine/decisionEngine').DecisionResult;
  awareness?: import('../../engine/awarenessEngine').AwarenessInsight;
  opportunity?: import('../../engine/potentialEngine').Opportunity;
  potentialBrief?: import('../../engine/potentialEngine').PotentialBrief;
  learning?: LearningReport;
}

export interface BrainResponse {
  intent: BrainIntent;
  answer: string;
  headline?: string;
  nextAction?: string;
  confidence: number;
  sources: ContextSource[];
  slicesUsed: string[];
  engines: string[];
  memoryUpdated: boolean;
  memoryDiscarded: boolean;
  missionAligned: boolean;
  timestamp: string;
  decision?: import('./decisions/types').DecisionAIResult;
  awareness?: import('../../engine/awarenessEngine').AwarenessInsight;
  opportunity?: import('../../engine/potentialEngine').Opportunity;
  potentialBrief?: import('../../engine/potentialEngine').PotentialBrief;
  learning?: LearningReport;
  decisionRecordId?: string;
}

export interface MemoryUpdateResult {
  updated: boolean;
  discarded: boolean;
  sessionId?: string;
  recordsAdded: MemoryRecord[];
}

export interface EngineRoutePlan {
  engines: Array<'decision' | 'awareness' | 'potential' | 'learning' | 'context' | 'memory' | 'reality'>;
  topics: ContextTopic[];
}
