import type { KnowledgeExtractionCandidate } from '../extractors/knowledge-extractor.types';
import type { KnowledgeItem, KnowledgeOwner, KnowledgeStatus } from '../models/knowledge.types';
import { buildKnowledgeDedupKey } from '../models/knowledge.types';
import { buildKnowledgeId, getKnowledgeStore } from '../store';

function mergeUnique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export async function upsertKnowledgeCandidate(input: {
  owner: KnowledgeOwner;
  sourceId: KnowledgeItem['sourceId'];
  sourceType: string;
  candidate: KnowledgeExtractionCandidate;
  status?: KnowledgeStatus;
}): Promise<{ item: KnowledgeItem; created: boolean }> {
  const store = getKnowledgeStore();
  const dedupKey = buildKnowledgeDedupKey(
    input.owner,
    input.candidate.knowledgeType,
    input.candidate.label
  );
  const existing = await store.findByDedupKey(dedupKey);
  const now = new Date().toISOString();

  if (existing) {
    const item = await store.upsert({
      ...existing,
      summary: input.candidate.summary || existing.summary,
      confidence: Math.max(existing.confidence, input.candidate.confidence),
      evidenceIds: mergeUnique([...existing.evidenceIds, input.candidate.evidenceId]),
      evidenceUrls: mergeUnique([...existing.evidenceUrls, input.candidate.evidenceUrl]),
      metadata: { ...existing.metadata, ...input.candidate.metadata },
      status: input.status ?? existing.status,
      updatedAt: now
    });
    return { item, created: false };
  }

  const item = await store.upsert({
    id: buildKnowledgeId(dedupKey),
    owner: input.owner,
    sourceId: input.sourceId,
    sourceType: input.sourceType,
    knowledgeType: input.candidate.knowledgeType,
    label: input.candidate.label,
    summary: input.candidate.summary,
    confidence: input.candidate.confidence,
    evidenceIds: [input.candidate.evidenceId],
    evidenceUrls: [input.candidate.evidenceUrl],
    metadata: input.candidate.metadata ?? {},
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now
  });

  return { item, created: true };
}

export async function listPersistedKnowledge(owner: KnowledgeOwner = 'giuseppe'): Promise<KnowledgeItem[]> {
  return getKnowledgeStore().listByOwner(owner);
}

export async function listPersistedKnowledgeBySource(
  sourceId: KnowledgeItem['sourceId'],
  owner: KnowledgeOwner = 'giuseppe'
): Promise<KnowledgeItem[]> {
  return getKnowledgeStore().listBySource(owner, sourceId);
}
