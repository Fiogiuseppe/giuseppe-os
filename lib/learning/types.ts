/**
 * Continuous Learning + Memory Graph — foundation types.
 * Contract only — no runtime engine in this module yet.
 *
 * Docs:
 * - docs/engines/CONTINUOUS_LEARNING_ENGINE.md
 * - docs/engines/MEMORY_GRAPH.md
 */

export const LEARNING_ENGINE_VERSION = '0.1.0' as const;
export const MEMORY_GRAPH_VERSION = '0.1.0' as const;

/** Max nodes the extractor may propose per interaction. */
export const MAX_EXTRACTIONS_PER_INTERACTION = 8;

/** Max resource recommendations per weekly learning cycle. */
export const MAX_WEEKLY_LEARNING_RECOMMENDATIONS = 3;

/** Minimum confidence to persist an extracted node. */
export const MIN_EXTRACTION_CONFIDENCE = 0.4;

/** Minimum confidence to publish a resource recommendation. */
export const MIN_RECOMMENDATION_CONFIDENCE = 0.55;

// ---------------------------------------------------------------------------
// Memory Graph
// ---------------------------------------------------------------------------

export type MemoryNodeKind =
  | 'interest'
  | 'preference'
  | 'decision'
  | 'recurring_mistake'
  | 'lesson'
  | 'person'
  | 'relationship'
  | 'value'
  | 'belief'
  | 'goal'
  | 'idea'
  | 'project'
  | 'skill_gap'
  | 'pattern';

export type MemoryNodeStatus = 'active' | 'dormant' | 'archived' | 'disputed';

export type MemoryEdgeKind =
  | 'supports'
  | 'contradicts'
  | 'repeats'
  | 'enables'
  | 'blocks'
  | 'part_of'
  | 'relates_to'
  | 'learned_from'
  | 'same_pattern_as'
  | 'addresses'
  | 'mentions';

export type MemorySourceType =
  | 'brain'
  | 'decision_intake'
  | 'decision_review'
  | 'content'
  | 'briefing'
  | 'manual'
  | 'inference';

export interface MemorySourceRef {
  type: MemorySourceType;
  id: string;
  label?: string;
  observedAt?: string;
}

export interface MemoryGraphNode {
  id: string;
  kind: MemoryNodeKind;
  label: string;
  content?: string;
  /** 0..1 — influences ranking, not shown as raw score in product UI. */
  importance: number;
  /** 0..1 */
  confidence: number;
  status: MemoryNodeStatus;
  sourceRefs: MemorySourceRef[];
  observedAt: string;
  updatedAt: string;
  /** Optional link to long-term decision id, lesson id, etc. */
  externalRefs?: string[];
}

export interface MemoryGraphEdge {
  id: string;
  from: string;
  to: string;
  kind: MemoryEdgeKind;
  strength?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryGraph {
  version: typeof MEMORY_GRAPH_VERSION | string;
  updatedAt: string;
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
}

export type MemoryInteractionSource =
  | 'brain'
  | 'decision_review'
  | 'decision_intake'
  | 'content'
  | 'manual';

export interface MemoryExtractionInput {
  source: MemoryInteractionSource;
  locale: 'it' | 'en';
  userText: string;
  assistantText?: string;
  /** Structured fields when source is decision_* */
  decisionId?: string;
  intent?: string;
  existingGraph: MemoryGraph;
  /** ISO timestamp of the interaction */
  observedAt: string;
}

export interface RejectedExtraction {
  label: string;
  reason: string;
}

export interface MemoryExtractionResult {
  proposedNodes: MemoryGraphNode[];
  proposedEdges: MemoryGraphEdge[];
  rejected: RejectedExtraction[];
  confidenceNote?: string;
  shouldPersist: boolean;
}

// ---------------------------------------------------------------------------
// Knowledge gaps
// ---------------------------------------------------------------------------

export type GapUrgency = 'high' | 'medium' | 'low';

export interface KnowledgeGap {
  id: string;
  /** Short name, e.g. "Pricing strategy for creative products" */
  label: string;
  description: string;
  /** Required — must cite graph nodes, decisions, or patterns */
  evidence: string[];
  blockingGoal?: string;
  relatedProject?: string;
  relatedPattern?: string;
  /** 0..1 */
  confidence: number;
  urgency: GapUrgency;
  detectedAt: string;
  /** Graph node ids this gap connects to */
  linkedNodeIds: string[];
}

// ---------------------------------------------------------------------------
// Continuous Learning — resource recommendations
// ---------------------------------------------------------------------------

export type LearningResourceKind =
  | 'book'
  | 'podcast'
  | 'article'
  | 'paper'
  | 'video'
  | 'course'
  | 'person'
  | 'company'
  | 'tool'
  | 'mental_model';

export type LearningPriority = 'high' | 'medium' | 'low';

export interface LearningRecommendation {
  id: string;
  title: string;
  kind: LearningResourceKind;
  /** Perché rilevante proprio ora */
  whyNow: string;
  /** In che modo aiuterà Giuseppe */
  howItHelps: string;
  /** Honest estimate: "45 min", "6 settimane", etc. */
  timeRequired: string;
  priority: LearningPriority;
  /** Impatto previsto sugli obiettivi personali */
  expectedImpact: string;
  /** Required — memory ids, decision ids, pattern refs, graph node ids */
  evidence: string[];
  gapAddressed: string;
  /** 0..1 */
  confidence: number;
  /** One line: why this is Giuseppe-specific, not generic */
  personalizationNote: string;
  /** Optional URL when resource is known and stable */
  url?: string;
  generatedAt: string;
}

export type LearningSilenceReason =
  | 'insufficient_evidence'
  | 'no_new_gaps'
  | 'quality_gate_failed'
  | 'trajectory_filtered'
  | 'mock_mode_empty';

export interface ContinuousLearningReport {
  version: typeof LEARNING_ENGINE_VERSION | string;
  generatedAt: string;
  gaps: KnowledgeGap[];
  recommendations: LearningRecommendation[];
  silenceReason?: LearningSilenceReason;
  silenceMessage?: string;
  /** Audit: which graph nodes / decisions informed this run */
  sourcesUsed: string[];
}

// ---------------------------------------------------------------------------
// Engine inputs (future runtime)
// ---------------------------------------------------------------------------

export interface ContinuousLearningInput {
  locale: 'it' | 'en';
  graph: MemoryGraph;
  /** ISO week key or date key for cache */
  cycleKey: string;
  /** Read-only context ids already loaded server-side */
  activeProjectNames: string[];
  recentDecisionIds: string[];
  patternLabels: string[];
}

export interface GapDetectorInput {
  graph: MemoryGraph;
  activeProjectNames: string[];
  priorities: string[];
  recentLessons: string[];
  patterns: string[];
}

export interface GapDetectorResult {
  gaps: KnowledgeGap[];
  note: string;
}

// ---------------------------------------------------------------------------
// Learning loop — post-decision
// ---------------------------------------------------------------------------

export interface DecisionLearningReflection {
  decisionId: string;
  question: 'cosa_posso_imparare';
  lessonSummary: string;
  proposedGraphUpdates: MemoryExtractionResult;
  patternUpdate?: string;
  twinUpdateNote?: string;
}

// ---------------------------------------------------------------------------
// Future engine contracts (signatures only — no implementation)
// ---------------------------------------------------------------------------

export interface MemoryExtractor {
  extract(input: MemoryExtractionInput): Promise<MemoryExtractionResult>;
}

export interface GapDetector {
  detect(input: GapDetectorInput): Promise<GapDetectorResult>;
}

export interface ContinuousLearningEngine {
  run(input: ContinuousLearningInput): Promise<ContinuousLearningReport>;
}
