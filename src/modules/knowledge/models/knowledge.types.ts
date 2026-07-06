import type { SourceProviderId } from '../../sources/providers/source-provider.types';

export const KNOWLEDGE_TYPES = [
  'project',
  'topic',
  'value',
  'skill',
  'service',
  'product',
  'brand',
  'person',
  'statement',
  'theme',
  'goal',
  'unknown'
] as const;

export type KnowledgeType = (typeof KNOWLEDGE_TYPES)[number];

export const KNOWLEDGE_STATUSES = ['active', 'inferred', 'archived', 'needs_review'] as const;

export type KnowledgeStatus = (typeof KNOWLEDGE_STATUSES)[number];

export type KnowledgeOwner = 'giuseppe';

/** Full persisted knowledge record — server-side only. */
export type KnowledgeItem = {
  id: string;
  owner: KnowledgeOwner;
  sourceId: SourceProviderId;
  sourceType: string;
  knowledgeType: KnowledgeType;
  label: string;
  summary: string;
  confidence: number;
  evidenceIds: string[];
  evidenceUrls: string[];
  metadata: Record<string, unknown>;
  status: KnowledgeStatus;
  createdAt: string;
  updatedAt: string;
};

/** Safe metadata returned to API/UI — no raw provider payloads. */
export type SafeKnowledgeItem = {
  id: string;
  owner: KnowledgeOwner;
  sourceId: SourceProviderId;
  sourceType: string;
  knowledgeType: KnowledgeType;
  label: string;
  summary: string;
  confidence: number;
  evidenceIds: string[];
  evidenceUrls: string[];
  status: KnowledgeStatus;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeExtractionResult = {
  created: number;
  updated: number;
  items: KnowledgeItem[];
};

export type KnowledgeListResponse = {
  items: SafeKnowledgeItem[];
  updatedAt: string;
};

export function normalizeKnowledgeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function buildKnowledgeDedupKey(
  owner: KnowledgeOwner,
  knowledgeType: KnowledgeType,
  label: string
): string {
  return `${owner}:${knowledgeType}:${normalizeKnowledgeLabel(label)}`;
}

export function toSafeKnowledgeItem(item: KnowledgeItem): SafeKnowledgeItem {
  return {
    id: item.id,
    owner: item.owner,
    sourceId: item.sourceId,
    sourceType: item.sourceType,
    knowledgeType: item.knowledgeType,
    label: item.label,
    summary: item.summary,
    confidence: item.confidence,
    evidenceIds: item.evidenceIds,
    evidenceUrls: item.evidenceUrls,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}
