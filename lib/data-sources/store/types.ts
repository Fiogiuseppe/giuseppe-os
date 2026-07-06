import { isSupabaseConfigured } from '../../memory/supabase/client';
import type {
  DataSource,
  DataSourceId,
  EvidenceItem,
  NormalizedSourceItem,
  RawSourceItem
} from '../types';

export type DataSourceStoreBackend = 'supabase' | 'memory';

export type UpsertDataSourceInput = Omit<DataSource, 'createdAt' | 'readOnly'> & {
  createdAt?: string;
};

export type SaveRawSourceItemInput = Omit<RawSourceItem, 'id' | 'createdAt' | 'fetchedAt'> & {
  id?: string;
  fetchedAt?: string;
  createdAt?: string;
};

export type SaveNormalizedSourceItemInput = Omit<NormalizedSourceItem, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export type SaveEvidenceItemInput = Omit<EvidenceItem, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export interface DataSourceStore {
  backend: DataSourceStoreBackend;
  upsertDataSource(input: UpsertDataSourceInput): Promise<DataSource>;
  getDataSource(source: DataSourceId, account: string): Promise<DataSource | null>;
  findRawItem(source: DataSourceId, account: string, externalId: string): Promise<RawSourceItem | null>;
  saveRawItem(input: SaveRawSourceItemInput): Promise<RawSourceItem>;
  saveNormalizedItem(input: SaveNormalizedSourceItemInput): Promise<NormalizedSourceItem>;
  saveEvidenceItem(input: SaveEvidenceItemInput): Promise<EvidenceItem>;
  listEvidenceBySource(source: DataSourceId, account: string, limit?: number): Promise<EvidenceItem[]>;
}

export function resolveDataSourceStoreBackend(): DataSourceStoreBackend {
  if (process.env.DATA_SOURCES_STORE === 'memory' || process.env.SOURCES_ENGINE_STORE === 'memory') {
    return 'memory';
  }

  return isSupabaseConfigured() ? 'supabase' : 'memory';
}
