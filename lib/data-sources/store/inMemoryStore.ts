import type {
  DataSource,
  DataSourceId,
  EvidenceItem,
  NormalizedSourceItem,
  RawSourceItem
} from '../types';
import type {
  DataSourceStore,
  SaveEvidenceItemInput,
  SaveNormalizedSourceItemInput,
  SaveRawSourceItemInput,
  UpsertDataSourceInput
} from './types';

function buildRawId(source: DataSourceId, account: string, externalId: string): string {
  return `raw_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}_${externalId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

function buildDataSourceId(source: DataSourceId, account: string): string {
  return `ds_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

const dataSources = new Map<string, DataSource>();
const rawItems = new Map<string, RawSourceItem>();
const normalizedItems = new Map<string, NormalizedSourceItem>();
const evidenceItems = new Map<string, EvidenceItem>();

export const inMemoryDataSourceStore: DataSourceStore = {
  backend: 'memory',

  async upsertDataSource(input: UpsertDataSourceInput): Promise<DataSource> {
    const id = input.id || buildDataSourceId(input.source, input.account);
    const now = input.createdAt ?? new Date().toISOString();
    const existing = dataSources.get(id);

    const record: DataSource = {
      id,
      source: input.source,
      account: input.account,
      label: input.label,
      authStatus: input.authStatus,
      readOnly: true,
      lastSyncAt: input.lastSyncAt ?? existing?.lastSyncAt ?? null,
      createdAt: existing?.createdAt ?? now
    };

    dataSources.set(id, record);
    return record;
  },

  async getDataSource(source: DataSourceId, account: string): Promise<DataSource | null> {
    return dataSources.get(buildDataSourceId(source, account)) ?? null;
  },

  async saveRawItem(input: SaveRawSourceItemInput): Promise<RawSourceItem> {
    const id = input.id ?? buildRawId(input.source, input.account, input.externalId);
    const now = new Date().toISOString();
    const record: RawSourceItem = {
      id,
      source: input.source,
      account: input.account,
      externalId: input.externalId,
      rawJson: input.rawJson,
      fetchedAt: input.fetchedAt ?? now,
      createdAt: input.createdAt ?? now
    };
    rawItems.set(id, record);
    return record;
  },

  async saveNormalizedItem(input: SaveNormalizedSourceItemInput): Promise<NormalizedSourceItem> {
    const id =
      input.id ??
      `norm_${input.source}_${input.account.replace(/[^a-zA-Z0-9]+/g, '_')}_${input.externalId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
    const record: NormalizedSourceItem = {
      id,
      rawItemId: input.rawItemId,
      source: input.source,
      account: input.account,
      externalId: input.externalId,
      content: input.content,
      caption: input.caption,
      mediaUrls: input.mediaUrls,
      publishedAt: input.publishedAt,
      permalink: input.permalink,
      metrics: input.metrics,
      kind: input.kind,
      createdAt: input.createdAt ?? new Date().toISOString()
    };
    normalizedItems.set(id, record);
    return record;
  },

  async saveEvidenceItem(input: SaveEvidenceItemInput): Promise<EvidenceItem> {
    const id =
      input.id ?? `evidence_${input.source}_${input.account}_${input.normalizedItemId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
    const record: EvidenceItem = {
      id,
      normalizedItemId: input.normalizedItemId,
      source: input.source,
      account: input.account,
      attribution: input.attribution,
      summary: input.summary,
      dimensionHints: input.dimensionHints,
      confidence: input.confidence,
      traceId: input.traceId,
      publishedAt: input.publishedAt,
      permalink: input.permalink,
      createdAt: input.createdAt ?? new Date().toISOString()
    };
    evidenceItems.set(id, record);
    return record;
  },

  async listEvidenceBySource(source: DataSourceId, account: string, limit = 20): Promise<EvidenceItem[]> {
    return Array.from(evidenceItems.values())
      .filter(item => item.source === source && item.account === account)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
};

export function resetInMemoryDataSourceStoreForTests(): void {
  dataSources.clear();
  rawItems.clear();
  normalizedItems.clear();
  evidenceItems.clear();
}
