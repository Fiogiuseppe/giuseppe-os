import { getSupabaseClient } from '../../../../../lib/memory/supabase/client';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type {
  PersistedConnectionRecord,
  PersistedSyncRunRecord,
  SourceEngineStore,
  UpsertConnectionInput
} from './types';
import type { ConnectionStatus, HealthStatus } from '../../providers/source-provider.types';
import type { SyncMode, SyncRunStatus } from '../types';

type DbConnection = {
  source_id: string;
  connection_status: string;
  health_status: string;
  last_sync_at: string | null;
  permissions_granted: string[];
  data_collection_enabled: string[];
  health_note: string | null;
  sync_cursor: string | null;
  connected_at: string | null;
  updated_at: string;
};

type DbSyncRun = {
  id: string;
  source_id: string;
  mode: string;
  status: string;
  started_at: string;
  finished_at: string;
  fetched: number;
  normalized: number;
  evidence: number;
  error_message: string | null;
};

function parseConnection(row: DbConnection): PersistedConnectionRecord {
  return {
    sourceId: row.source_id as SourceProviderId,
    connectionStatus: row.connection_status as ConnectionStatus,
    healthStatus: row.health_status as HealthStatus,
    lastSyncAt: row.last_sync_at,
    permissionsGranted: row.permissions_granted ?? [],
    dataCollectionEnabled: row.data_collection_enabled ?? [],
    healthNote: row.health_note,
    syncCursor: row.sync_cursor,
    connectedAt: row.connected_at,
    updatedAt: row.updated_at
  };
}

function parseSyncRun(row: DbSyncRun): PersistedSyncRunRecord {
  return {
    id: row.id,
    sourceId: row.source_id as SourceProviderId,
    mode: row.mode as SyncMode,
    status: row.status as SyncRunStatus,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    fetched: row.fetched,
    normalized: row.normalized,
    evidence: row.evidence,
    errorMessage: row.error_message
  };
}

function createSyncRunId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const supabaseSourceEngineStore: SourceEngineStore = {
  backend: 'supabase',

  async getConnection(sourceId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('source_connections')
      .select('*')
      .eq('source_id', sourceId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? parseConnection(data as DbConnection) : null;
  },

  async listConnections() {
    const client = getSupabaseClient();
    const { data, error } = await client.from('source_connections').select('*');

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(row => parseConnection(row as DbConnection));
  },

  async upsertConnection(input: UpsertConnectionInput) {
    const client = getSupabaseClient();
    const updatedAt = input.updatedAt ?? new Date().toISOString();
    const payload = {
      source_id: input.sourceId,
      connection_status: input.connectionStatus,
      health_status: input.healthStatus,
      last_sync_at: input.lastSyncAt,
      permissions_granted: input.permissionsGranted,
      data_collection_enabled: input.dataCollectionEnabled,
      health_note: input.healthNote,
      sync_cursor: input.syncCursor,
      connected_at: input.connectedAt,
      updated_at: updatedAt
    };

    const { data, error } = await client
      .from('source_connections')
      .upsert(payload, { onConflict: 'source_id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return parseConnection(data as DbConnection);
  },

  async deleteConnection(sourceId) {
    const client = getSupabaseClient();
    const { error } = await client.from('source_connections').delete().eq('source_id', sourceId);
    if (error) {
      throw new Error(error.message);
    }
  },

  async appendSyncRun(input) {
    const client = getSupabaseClient();
    const id = input.id ?? createSyncRunId();
    const payload = {
      id,
      source_id: input.sourceId,
      mode: input.mode,
      status: input.status,
      started_at: input.startedAt,
      finished_at: input.finishedAt,
      fetched: input.fetched,
      normalized: input.normalized,
      evidence: input.evidence,
      error_message: input.errorMessage ?? null
    };

    const { data, error } = await client.from('source_sync_runs').insert(payload).select('*').single();
    if (error) {
      throw new Error(error.message);
    }

    return parseSyncRun(data as DbSyncRun);
  },

  async listSyncRuns(sourceId, limit = 20) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('source_sync_runs')
      .select('*')
      .eq('source_id', sourceId)
      .order('finished_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(row => parseSyncRun(row as DbSyncRun));
  },

  async resetForTests() {
    const client = getSupabaseClient();
    await client.from('source_sync_runs').delete().neq('id', '');
    await client.from('source_connections').delete().neq('source_id', '');
  }
};
