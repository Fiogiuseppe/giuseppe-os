import type { SourceProviderId } from '../../providers/source-provider.types';
import type { SyncLogEntry, SyncMode, SyncRunStatus } from '../types';
import {
  appendPersistedSyncRun,
  listPersistedSyncRuns,
  type SafeSyncRunMetadata
} from '../engine/sync-run-persistence.server';

export type { SafeSyncRunMetadata };

export async function appendSyncLog(input: {
  sourceId: SourceProviderId;
  mode: SyncMode;
  status: SyncRunStatus;
  startedAt: string;
  finishedAt: string;
  fetched: number;
  normalized: number;
  evidence: number;
  errorMessage?: string | null;
}): Promise<SyncLogEntry> {
  const record = await appendPersistedSyncRun(input);
  return {
    id: record.id,
    sourceId: record.sourceId,
    mode: record.mode,
    status: record.status,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    fetched: record.fetched,
    normalized: record.normalized,
    evidence: record.evidence,
    errorMessage: record.errorMessage
  };
}

export async function listSyncLogs(
  sourceId?: SourceProviderId,
  limit = 20
): Promise<SyncLogEntry[]> {
  if (!sourceId) {
    return [];
  }

  const runs = await listPersistedSyncRuns(sourceId, limit);
  return runs.map(run => ({
    id: run.id,
    sourceId: run.sourceId,
    mode: run.mode,
    status: run.status,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    fetched: run.fetched,
    normalized: run.normalized,
    evidence: run.evidence,
    errorMessage: run.errorMessage
  }));
}

export async function resetSyncLogsForTests(): Promise<void> {
  const { resetSourceEngineStoreForTests } = await import('../store');
  await resetSourceEngineStoreForTests();
}
