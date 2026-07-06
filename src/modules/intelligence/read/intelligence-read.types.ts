import type {
  KnowledgeOwner,
  KnowledgeStatus,
  KnowledgeType,
  SafeKnowledgeItem
} from '../../knowledge/models/knowledge.types';
import {
  KNOWLEDGE_STATUSES,
  KNOWLEDGE_TYPES
} from '../../knowledge/models/knowledge.types';
import type { SourceProviderId } from '../../sources/config/source-config';
import { isSourceProviderId, normalizeSourceId } from '../../sources/providers/source-registry';

export type IntelligenceKnowledgeQuery = {
  owner?: KnowledgeOwner;
  sourceId?: SourceProviderId;
  knowledgeType?: KnowledgeType;
  status?: KnowledgeStatus;
  /** Case-insensitive search across label and summary */
  q?: string;
};

export type IntelligenceKnowledgeReadResult = {
  items: SafeKnowledgeItem[];
  count: number;
  query: IntelligenceKnowledgeQuery;
  updatedAt: string;
};

export function isKnowledgeType(value: string): value is KnowledgeType {
  return (KNOWLEDGE_TYPES as readonly string[]).includes(value);
}

export function isKnowledgeStatus(value: string): value is KnowledgeStatus {
  return (KNOWLEDGE_STATUSES as readonly string[]).includes(value);
}

export function isKnowledgeOwner(value: string): value is KnowledgeOwner {
  return value === 'giuseppe';
}

export function parseIntelligenceKnowledgeQuery(
  searchParams: URLSearchParams
): IntelligenceKnowledgeQuery | null {
  const query: IntelligenceKnowledgeQuery = {};

  const owner = searchParams.get('owner');
  if (owner) {
    if (!isKnowledgeOwner(owner)) {
      return null;
    }
    query.owner = owner;
  }

  const sourceId = searchParams.get('sourceId');
  if (sourceId) {
    const normalized = normalizeSourceId(sourceId);
    if (!normalized) {
      return null;
    }
    query.sourceId = normalized;
  }

  const knowledgeType = searchParams.get('knowledgeType');
  if (knowledgeType) {
    if (!isKnowledgeType(knowledgeType)) {
      return null;
    }
    query.knowledgeType = knowledgeType;
  }

  const status = searchParams.get('status');
  if (status) {
    if (!isKnowledgeStatus(status)) {
      return null;
    }
    query.status = status;
  }

  const q = searchParams.get('q');
  if (q) {
    const trimmed = q.trim();
    if (!trimmed) {
      return null;
    }
    query.q = trimmed;
  }

  return query;
}
