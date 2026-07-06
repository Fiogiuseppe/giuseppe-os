import type { EvidenceItem } from '../../../../lib/data-sources/types';
import type { SourceProviderId } from '../../sources/providers/source-provider.types';
import { getKnowledgeExtractor } from '../extractors/registry.server';
import type { KnowledgeOwner, KnowledgeExtractionResult, SafeKnowledgeItem } from '../models/knowledge.types';
import { toSafeKnowledgeItem } from '../models/knowledge.types';
import { listPersistedKnowledge, upsertKnowledgeCandidate } from './knowledge-persistence.server';

export const DEFAULT_KNOWLEDGE_OWNER: KnowledgeOwner = 'giuseppe';

export function mapSourceType(sourceId: SourceProviderId): string {
  if (sourceId === 'website_personal' || sourceId === 'website_urees') {
    return 'website';
  }
  if (sourceId === 'medium_personal') {
    return 'feed';
  }
  if (sourceId.includes('instagram') || sourceId === 'linkedin_personal') {
    return 'social';
  }
  return sourceId;
}

/** Extract knowledge from evidence — only creates items when evidence exists. No LLM. */
export async function extractKnowledgeFromEvidence(input: {
  owner?: KnowledgeOwner;
  sourceId: SourceProviderId;
  evidence: EvidenceItem[];
}): Promise<KnowledgeExtractionResult> {
  const owner = input.owner ?? DEFAULT_KNOWLEDGE_OWNER;

  if (input.evidence.length === 0) {
    return { created: 0, updated: 0, items: [] };
  }

  const extractor = getKnowledgeExtractor(input.sourceId);
  if (!extractor) {
    return { created: 0, updated: 0, items: [] };
  }

  const candidates = extractor.extract({
    owner,
    sourceId: input.sourceId,
    sourceType: mapSourceType(input.sourceId),
    evidence: input.evidence
  });

  let created = 0;
  let updated = 0;
  const items = [];

  for (const candidate of candidates) {
    const result = await upsertKnowledgeCandidate({
      owner,
      sourceId: input.sourceId,
      sourceType: mapSourceType(input.sourceId),
      candidate,
      status: 'active'
    });

    if (result.created) {
      created += 1;
    } else {
      updated += 1;
    }
    items.push(result.item);
  }

  return { created, updated, items };
}

export async function listSafeKnowledgeItems(
  owner: KnowledgeOwner = DEFAULT_KNOWLEDGE_OWNER
): Promise<SafeKnowledgeItem[]> {
  const items = await listPersistedKnowledge(owner);
  return items.map(toSafeKnowledgeItem).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listSafeKnowledgeBySource(
  sourceId: SourceProviderId,
  owner: KnowledgeOwner = DEFAULT_KNOWLEDGE_OWNER
): Promise<SafeKnowledgeItem[]> {
  const { listPersistedKnowledgeBySource } = await import('./knowledge-persistence.server');
  const items = await listPersistedKnowledgeBySource(sourceId, owner);
  return items.map(toSafeKnowledgeItem).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
