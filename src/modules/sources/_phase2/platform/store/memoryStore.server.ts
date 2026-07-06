import type {
  PersistedConnectionRecord,
  PersistedSyncRunRecord,
  SourceEngineStore,
  UpsertConnectionInput
} from './types';
import type { SourceProviderId } from '../../providers/source-provider.types';

const connections = new Map<SourceProviderId, PersistedConnectionRecord>();
const syncRuns: PersistedSyncRunRecord[] = [];

function createSyncRunId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const memorySourceEngineStore: SourceEngineStore = {
  backend: 'memory',

  async getConnection(sourceId) {
    return connections.get(sourceId) ?? null;
  },

  async listConnections() {
    return Array.from(connections.values());
  },

  async upsertConnection(input: UpsertConnectionInput) {
    const record: PersistedConnectionRecord = {
      ...input,
      updatedAt: input.updatedAt ?? new Date().toISOString()
    };
    connections.set(input.sourceId, record);
    return record;
  },

  async deleteConnection(sourceId) {
    connections.delete(sourceId);
    for (let index = syncRuns.length - 1; index >= 0; index -= 1) {
      if (syncRuns[index]?.sourceId === sourceId) {
        syncRuns.splice(index, 1);
      }
    }
  },

  async appendSyncRun(input) {
    const record: PersistedSyncRunRecord = {
      id: input.id ?? createSyncRunId(),
      sourceId: input.sourceId,
      mode: input.mode,
      status: input.status,
      startedAt: input.startedAt,
      finishedAt: input.finishedAt,
      fetched: input.fetched,
      normalized: input.normalized,
      evidence: input.evidence,
      errorMessage: input.errorMessage ?? null
    };

    syncRuns.unshift(record);
    return record;
  },

  async listSyncRuns(sourceId, limit = 20) {
    return syncRuns.filter(run => run.sourceId === sourceId).slice(0, limit);
  },

  async resetForTests() {
    connections.clear();
    syncRuns.length = 0;
  }
};
