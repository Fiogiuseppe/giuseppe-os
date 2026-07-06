import { fileSourceEngineStore } from './fileStore.server';
import { memorySourceEngineStore } from './memoryStore.server';
import { resolveSourceEngineStoreBackend } from './resolve-backend';
import { supabaseSourceEngineStore } from './supabaseStore.server';
import type { SourceEngineStore } from './types';

export function getSourceEngineStore(): SourceEngineStore {
  const backend = resolveSourceEngineStoreBackend();

  if (backend === 'supabase') {
    return supabaseSourceEngineStore;
  }

  if (backend === 'file') {
    return fileSourceEngineStore;
  }

  return memorySourceEngineStore;
}

export async function resetSourceEngineStoreForTests(): Promise<void> {
  await getSourceEngineStore().resetForTests();
}

export type {
  PersistedConnectionRecord,
  PersistedSyncRunRecord,
  SourceEngineStore,
  SourceEngineStoreBackend
} from './types';
