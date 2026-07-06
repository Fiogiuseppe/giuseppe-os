import { getSupabaseClient } from '../../memory/supabase/client';
import type {
  DataSource,
  DataSourceAuthStatus,
  DataSourceId,
  EvidenceItem,
  NormalizedSourceItem,
  NormalizedSourceItemKind,
  RawSourceItem,
  SourceMetrics
} from '../types';
import type {
  DataSourceStore,
  SaveEvidenceItemInput,
  SaveNormalizedSourceItemInput,
  SaveRawSourceItemInput,
  UpsertDataSourceInput
} from './types';

type DbDataSource = {
  id: string;
  source: string;
  account: string;
  label: string;
  auth_status: string;
  read_only: boolean;
  last_sync_at: string | null;
  created_at: string;
};

type DbRawSourceItem = {
  id: string;
  source: string;
  account: string;
  external_id: string;
  raw_json: Record<string, unknown>;
  fetched_at: string;
  created_at: string;
};

type DbNormalizedSourceItem = {
  id: string;
  raw_item_id: string;
  source: string;
  account: string;
  external_id: string;
  content: string;
  caption: string | null;
  media_urls: string[];
  published_at: string;
  permalink: string;
  metrics: SourceMetrics | null;
  kind: string;
  created_at: string;
};

type DbEvidenceItem = {
  id: string;
  normalized_item_id: string;
  source: string;
  account: string;
  attribution: string;
  summary: string;
  dimension_hints: string[];
  confidence: string;
  trace_id: string;
  published_at: string;
  permalink: string;
  created_at: string;
};

function parseAuthStatus(value: string): DataSourceAuthStatus {
  if (value === 'connected' || value === 'needs_auth' || value === 'error' || value === 'disabled') {
    return value;
  }
  return 'needs_auth';
}

function parseDataSource(row: DbDataSource): DataSource {
  return {
    id: row.id,
    source: row.source as DataSourceId,
    account: row.account,
    label: row.label,
    authStatus: parseAuthStatus(row.auth_status),
    readOnly: true,
    lastSyncAt: row.last_sync_at,
    createdAt: row.created_at
  };
}

function parseRawItem(row: DbRawSourceItem): RawSourceItem {
  return {
    id: row.id,
    source: row.source as DataSourceId,
    account: row.account,
    externalId: row.external_id,
    rawJson: row.raw_json,
    fetchedAt: row.fetched_at,
    createdAt: row.created_at
  };
}

function parseNormalizedItem(row: DbNormalizedSourceItem): NormalizedSourceItem {
  return {
    id: row.id,
    rawItemId: row.raw_item_id,
    source: row.source as DataSourceId,
    account: row.account,
    externalId: row.external_id,
    content: row.content,
    caption: row.caption,
    mediaUrls: row.media_urls,
    publishedAt: row.published_at,
    permalink: row.permalink,
    metrics: row.metrics,
    kind: row.kind as NormalizedSourceItemKind,
    createdAt: row.created_at
  };
}

function parseEvidenceItem(row: DbEvidenceItem): EvidenceItem {
  return {
    id: row.id,
    normalizedItemId: row.normalized_item_id,
    source: row.source as DataSourceId,
    account: row.account,
    attribution: row.attribution,
    summary: row.summary,
    dimensionHints: row.dimension_hints as EvidenceItem['dimensionHints'],
    confidence:
      row.confidence === 'high' || row.confidence === 'medium' || row.confidence === 'low'
        ? row.confidence
        : 'low',
    traceId: row.trace_id,
    publishedAt: row.published_at,
    permalink: row.permalink,
    createdAt: row.created_at
  };
}

function buildDataSourceId(source: DataSourceId, account: string): string {
  return `ds_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

function buildRawId(source: DataSourceId, account: string, externalId: string): string {
  return `raw_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}_${externalId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
}

export const supabaseDataSourceStore: DataSourceStore = {
  backend: 'supabase',

  async upsertDataSource(input: UpsertDataSourceInput): Promise<DataSource> {
    const supabase = getSupabaseClient();
    const id = input.id || buildDataSourceId(input.source, input.account);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('data_sources')
      .upsert(
        {
          id,
          source: input.source,
          account: input.account,
          label: input.label,
          auth_status: input.authStatus,
          read_only: true,
          last_sync_at: input.lastSyncAt,
          created_at: input.createdAt ?? now
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return parseDataSource(data as DbDataSource);
  },

  async getDataSource(source: DataSourceId, account: string): Promise<DataSource | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('source', source)
      .eq('account', account)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? parseDataSource(data as DbDataSource) : null;
  },

  async saveRawItem(input: SaveRawSourceItemInput): Promise<RawSourceItem> {
    const supabase = getSupabaseClient();
    const id = input.id ?? buildRawId(input.source, input.account, input.externalId);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('raw_source_items')
      .upsert(
        {
          id,
          source: input.source,
          account: input.account,
          external_id: input.externalId,
          raw_json: input.rawJson,
          fetched_at: input.fetchedAt ?? now,
          created_at: input.createdAt ?? now
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return parseRawItem(data as DbRawSourceItem);
  },

  async saveNormalizedItem(input: SaveNormalizedSourceItemInput): Promise<NormalizedSourceItem> {
    const supabase = getSupabaseClient();
    const id =
      input.id ??
      `norm_${input.source}_${input.account.replace(/[^a-zA-Z0-9]+/g, '_')}_${input.externalId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('normalized_source_items')
      .upsert(
        {
          id,
          raw_item_id: input.rawItemId,
          source: input.source,
          account: input.account,
          external_id: input.externalId,
          content: input.content,
          caption: input.caption,
          media_urls: input.mediaUrls,
          published_at: input.publishedAt,
          permalink: input.permalink,
          metrics: input.metrics,
          kind: input.kind,
          created_at: input.createdAt ?? now
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return parseNormalizedItem(data as DbNormalizedSourceItem);
  },

  async saveEvidenceItem(input: SaveEvidenceItemInput): Promise<EvidenceItem> {
    const supabase = getSupabaseClient();
    const id =
      input.id ??
      `evidence_${input.source}_${input.account}_${input.normalizedItemId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('evidence_items')
      .upsert(
        {
          id,
          normalized_item_id: input.normalizedItemId,
          source: input.source,
          account: input.account,
          attribution: input.attribution,
          summary: input.summary,
          dimension_hints: input.dimensionHints,
          confidence: input.confidence,
          trace_id: input.traceId,
          published_at: input.publishedAt,
          permalink: input.permalink,
          created_at: input.createdAt ?? now
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return parseEvidenceItem(data as DbEvidenceItem);
  },

  async listEvidenceBySource(source: DataSourceId, account: string, limit = 20): Promise<EvidenceItem[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('source', source)
      .eq('account', account)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data as DbEvidenceItem[]).map(parseEvidenceItem);
  }
};
