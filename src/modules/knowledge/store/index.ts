import { fileKnowledgeStore } from './fileStore.server';
import { memoryKnowledgeStore } from './memoryStore.server';
import { resolveKnowledgeStoreBackend } from './resolve-backend';
import { supabaseKnowledgeStore } from './supabaseStore.server';
import type { KnowledgeStore } from './types';

export function getKnowledgeStore(): KnowledgeStore {
  const backend = resolveKnowledgeStoreBackend();

  if (backend === 'supabase') {
    return supabaseKnowledgeStore;
  }

  if (backend === 'file') {
    return fileKnowledgeStore;
  }

  return memoryKnowledgeStore;
}

export async function resetKnowledgeStoreForTests(): Promise<void> {
  await getKnowledgeStore().resetForTests();
}

export { buildKnowledgeId } from './types';
export type { KnowledgeStore, KnowledgeStoreBackend, UpsertKnowledgeInput } from './types';
