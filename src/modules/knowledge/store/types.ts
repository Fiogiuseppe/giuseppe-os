import type { KnowledgeItem, KnowledgeOwner, KnowledgeStatus, KnowledgeType } from '../models/knowledge.types';
import { buildKnowledgeDedupKey } from '../models/knowledge.types';

export type KnowledgeStoreBackend = 'supabase' | 'file' | 'memory';

export type UpsertKnowledgeInput = Omit<KnowledgeItem, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export interface KnowledgeStore {
  backend: KnowledgeStoreBackend;
  findByDedupKey(dedupKey: string): Promise<KnowledgeItem | null>;
  listByOwner(owner: KnowledgeOwner): Promise<KnowledgeItem[]>;
  listBySource(owner: KnowledgeOwner, sourceId: KnowledgeItem['sourceId']): Promise<KnowledgeItem[]>;
  upsert(input: UpsertKnowledgeInput): Promise<KnowledgeItem>;
  resetForTests(): Promise<void>;
}

export function buildKnowledgeId(dedupKey: string): string {
  return `knowledge_${dedupKey.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

export { buildKnowledgeDedupKey };
