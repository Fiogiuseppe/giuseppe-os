import type { SafeKnowledgeItem } from '../../knowledge/models/knowledge.types';
import { normalizeKnowledgeLabel } from '../../knowledge/models/knowledge.types';
import type { IntelligenceKnowledgeQuery } from './intelligence-read.types';

function matchesSearch(item: SafeKnowledgeItem, q: string): boolean {
  const needle = normalizeKnowledgeLabel(q);
  const haystacks = [
    normalizeKnowledgeLabel(item.label),
    normalizeKnowledgeLabel(item.summary),
    item.sourceId.toLowerCase()
  ];

  return haystacks.some(haystack => haystack.includes(needle));
}

/** Deterministic in-memory filter — read-only, no LLM. */
export function filterKnowledgeItems(
  items: SafeKnowledgeItem[],
  query: IntelligenceKnowledgeQuery
): SafeKnowledgeItem[] {
  return items
    .filter(item => {
      if (query.owner && item.owner !== query.owner) {
        return false;
      }

      if (query.sourceId && item.sourceId !== query.sourceId) {
        return false;
      }

      if (query.knowledgeType && item.knowledgeType !== query.knowledgeType) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      if (query.q && !matchesSearch(item, query.q)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
