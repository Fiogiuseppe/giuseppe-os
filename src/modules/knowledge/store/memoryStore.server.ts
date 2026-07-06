import type { KnowledgeItem, KnowledgeOwner } from '../models/knowledge.types';
import { buildKnowledgeDedupKey, buildKnowledgeId } from './types';
import type { KnowledgeStore, UpsertKnowledgeInput } from './types';

const items = new Map<string, KnowledgeItem>();
const dedupIndex = new Map<string, string>();

export const memoryKnowledgeStore: KnowledgeStore = {
  backend: 'memory',

  async findByDedupKey(dedupKey) {
    const id = dedupIndex.get(dedupKey);
    return id ? (items.get(id) ?? null) : null;
  },

  async listByOwner(owner) {
    return Array.from(items.values()).filter(item => item.owner === owner);
  },

  async listBySource(owner, sourceId) {
    return Array.from(items.values()).filter(
      item => item.owner === owner && item.sourceId === sourceId
    );
  },

  async upsert(input: UpsertKnowledgeInput) {
    const dedupKey = buildKnowledgeDedupKey(input.owner, input.knowledgeType, input.label);
    const id = input.id ?? buildKnowledgeId(dedupKey);
    const now = new Date().toISOString();
    const record: KnowledgeItem = {
      ...input,
      id,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now
    };
    items.set(id, record);
    dedupIndex.set(dedupKey, id);
    return record;
  },

  async resetForTests() {
    items.clear();
    dedupIndex.clear();
  }
};

export async function resetMemoryKnowledgeStoreForTests(): Promise<void> {
  await memoryKnowledgeStore.resetForTests();
}
