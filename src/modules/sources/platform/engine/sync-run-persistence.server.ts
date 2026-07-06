import type { SourceProviderId } from '../../providers/source-provider.types';
import { getSourceEngineStore } from '../store';
import type { PersistedSyncRunRecord } from '../store/types';
import type { SyncMode, SyncRunStatus } from '../types';

export type SafeSyncRunMetadata = {
  id: string;
  sourceId: SourceProviderId;
  mode: SyncMode;
  status: SyncRunStatus;
  startedAt: string;
  finishedAt: string;
  fetched: number;
  normalized: number;
  evidence: number;
  errorMessage: string | null;
};

export async function appendPersistedSyncRun(input: {
  sourceId: SourceProviderId;
  mode: SyncMode;
  status: SyncRunStatus;
  startedAt: string;
  finishedAt: string;
  fetched: number;
  normalized: number;
  evidence: number;
  errorMessage?: string | null;
}): Promise<PersistedSyncRunRecord> {
  return getSourceEngineStore().appendSyncRun({
    sourceId: input.sourceId,
    mode: input.mode,
    status: input.status,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    fetched: input.fetched,
    normalized: input.normalized,
    evidence: input.evidence,
    errorMessage: input.errorMessage ?? null
  });
}

export async function listPersistedSyncRuns(
  sourceId: SourceProviderId,
  limit = 20
): Promise<SafeSyncRunMetadata[]> {
  const runs = await getSourceEngineStore().listSyncRuns(sourceId, limit);
  return runs.map(toSafeSyncRunMetadata);
}

function toSafeSyncRunMetadata(run: PersistedSyncRunRecord): SafeSyncRunMetadata {
  return {
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
  };
}

export async function getLatestSyncRun(
  sourceId: SourceProviderId
): Promise<SafeSyncRunMetadata | null> {
  const runs = await listPersistedSyncRuns(sourceId, 1);
  return runs[0] ?? null;
}
