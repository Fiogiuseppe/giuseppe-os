import { resolveDataSourceStoreBackend } from './types';
import { inMemoryDataSourceStore } from './inMemoryStore';
import { supabaseDataSourceStore } from './supabase';
import type { DataSourceStore } from './types';

export function getDataSourceStore(): DataSourceStore {
  return resolveDataSourceStoreBackend() === 'supabase' ? supabaseDataSourceStore : inMemoryDataSourceStore;
}

export { resetInMemoryDataSourceStoreForTests } from './inMemoryStore';
export type {
  DataSourceStore,
  DataSourceStoreBackend,
  SaveEvidenceItemInput,
  SaveNormalizedSourceItemInput,
  SaveRawSourceItemInput,
  UpsertDataSourceInput
} from './types';
