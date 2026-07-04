/**
 * Identity Graph — core types.
 * Memory stores facts. The graph stores meaning through relationships.
 */

export const IDENTITY_GRAPH_VERSION = '0.1.0' as const;

export type IdentityNodeKind =
  | 'value'
  | 'principle'
  | 'long_term_goal'
  | 'project'
  | 'habit'
  | 'relationship'
  | 'decision'
  | 'lesson'
  | 'skill'
  | 'interest'
  | 'life_event'
  | 'pattern'
  | 'ambition';

export type IdentityNodeStatus = 'active' | 'dormant' | 'completed' | 'archived';

export type IdentityEdgeKind =
  | 'supports'
  | 'derives_from'
  | 'reinforces'
  | 'contrasts'
  | 'contradicts'
  | 'enables'
  | 'blocks'
  | 'part_of'
  | 'leads_to'
  | 'relates_to';

export type IdentitySourceType =
  | 'memory'
  | 'decision'
  | 'project'
  | 'writing'
  | 'relationship'
  | 'finance'
  | 'external'
  | 'constitution'
  | 'inference'
  | 'manual';

export interface IdentitySourceRef {
  type: IdentitySourceType;
  id: string;
  label?: string;
  observedAt?: string;
}

export interface IdentityNode {
  id: string;
  kind: IdentityNodeKind;
  label: string;
  description?: string;
  status: IdentityNodeStatus;
  sourceRefs?: IdentitySourceRef[];
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface IdentityEdge {
  id: string;
  from: string;
  to: string;
  kind: IdentityEdgeKind;
  label?: string;
  strength?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdentityGraph {
  version: typeof IDENTITY_GRAPH_VERSION | string;
  updatedAt: string;
  nodes: IdentityNode[];
  edges: IdentityEdge[];
}

export type IdentityQuery =
  | { type: 'node'; id: string }
  | { type: 'kind'; kind: IdentityNodeKind; status?: IdentityNodeStatus }
  | {
      type: 'neighbors';
      id: string;
      depth?: number;
      direction?: 'out' | 'in' | 'both';
      edgeKinds?: IdentityEdgeKind[];
      nodeKinds?: IdentityNodeKind[];
    }
  | { type: 'path'; from: string; to: string; maxDepth?: number; edgeKinds?: IdentityEdgeKind[] }
  | {
      type: 'traverse';
      from: string;
      edgeKinds?: IdentityEdgeKind[];
      maxDepth: number;
      direction?: 'out' | 'in';
    }
  | { type: 'search'; text: string; kinds?: IdentityNodeKind[]; limit?: number }
  | { type: 'related'; id: string; kinds?: IdentityNodeKind[]; maxDepth?: number };

export interface IdentityQueryResult {
  query: IdentityQuery;
  nodes: IdentityNode[];
  edges: IdentityEdge[];
  paths?: string[][];
}

export interface IdentityGraphValidationIssue {
  code: 'duplicate_node' | 'duplicate_edge' | 'missing_node' | 'invalid_strength' | 'self_loop';
  message: string;
  entityId?: string;
}

export interface IdentityGraphValidationReport {
  valid: boolean;
  issues: IdentityGraphValidationIssue[];
}

/** Legacy interpretation overlay — meaning applied to sourced facts (future layer). */
export interface IdentityInterpretation {
  nodeId: string;
  meaning: string;
  confidence: 'high' | 'medium' | 'low';
  reinterpretedAt: string;
  rationale: string;
}

export interface MemoryFact {
  id: string;
  text: string;
  source: IdentitySourceType;
  observedAt: string;
}
