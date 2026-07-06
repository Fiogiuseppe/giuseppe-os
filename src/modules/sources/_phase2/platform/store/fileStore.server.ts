import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  PersistedConnectionRecord,
  PersistedSyncRunRecord,
  SourceEngineStore,
  UpsertConnectionInput
} from './types';
import type { SourceProviderId } from '../../providers/source-provider.types';

type FileSnapshot = {
  connections: PersistedConnectionRecord[];
  syncRuns: PersistedSyncRunRecord[];
};

const DATA_DIR = path.join(process.cwd(), '.data', 'sources-engine');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

async function readSnapshot(): Promise<FileSnapshot> {
  try {
    const raw = await readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as FileSnapshot;
    return {
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      syncRuns: Array.isArray(parsed.syncRuns) ? parsed.syncRuns : []
    };
  } catch {
    return { connections: [], syncRuns: [] };
  }
}

async function writeSnapshot(snapshot: FileSnapshot): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
}

function createSyncRunId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const fileSourceEngineStore: SourceEngineStore = {
  backend: 'file',

  async getConnection(sourceId) {
    const snapshot = await readSnapshot();
    return snapshot.connections.find(row => row.sourceId === sourceId) ?? null;
  },

  async listConnections() {
    const snapshot = await readSnapshot();
    return snapshot.connections;
  },

  async upsertConnection(input: UpsertConnectionInput) {
    const snapshot = await readSnapshot();
    const record: PersistedConnectionRecord = {
      ...input,
      updatedAt: input.updatedAt ?? new Date().toISOString()
    };

    const index = snapshot.connections.findIndex(row => row.sourceId === input.sourceId);
    if (index >= 0) {
      snapshot.connections[index] = record;
    } else {
      snapshot.connections.push(record);
    }

    await writeSnapshot(snapshot);
    return record;
  },

  async deleteConnection(sourceId) {
    const snapshot = await readSnapshot();
    snapshot.connections = snapshot.connections.filter(row => row.sourceId !== sourceId);
    snapshot.syncRuns = snapshot.syncRuns.filter(row => row.sourceId !== sourceId);
    await writeSnapshot(snapshot);
  },

  async appendSyncRun(input) {
    const snapshot = await readSnapshot();
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

    snapshot.syncRuns.unshift(record);
    if (snapshot.syncRuns.length > 500) {
      snapshot.syncRuns.length = 500;
    }

    await writeSnapshot(snapshot);
    return record;
  },

  async listSyncRuns(sourceId, limit = 20) {
    const snapshot = await readSnapshot();
    return snapshot.syncRuns.filter(run => run.sourceId === sourceId).slice(0, limit);
  },

  async resetForTests() {
    await writeSnapshot({ connections: [], syncRuns: [] });
  }
};
