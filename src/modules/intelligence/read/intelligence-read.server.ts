import {
  DEFAULT_KNOWLEDGE_OWNER,
  listSafeKnowledgeItems
} from '../../knowledge/services/knowledge.server';
import { filterKnowledgeItems } from './knowledge-query.server';
import type {
  IntelligenceKnowledgeQuery,
  IntelligenceKnowledgeReadResult
} from './intelligence-read.types';

/** Read-only intelligence layer over structured knowledge. No LLM. */
export async function readKnowledge(
  query: IntelligenceKnowledgeQuery = {}
): Promise<IntelligenceKnowledgeReadResult> {
  const owner = query.owner ?? DEFAULT_KNOWLEDGE_OWNER;
  const resolvedQuery = { ...query, owner };

  const allItems = await listSafeKnowledgeItems(owner);
  const items = filterKnowledgeItems(allItems, resolvedQuery);

  return {
    items,
    count: items.length,
    query: resolvedQuery,
    updatedAt: new Date().toISOString()
  };
}
