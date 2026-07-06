import type { SourceAdapter } from '../adapter.types';
import { appendSyncLog } from './sync-log.server';
import { assertRateLimit } from './rate-limiter.server';
import { persistRawSyncItems } from '../engine/raw-data-persistence.server';
import { writeConnectionState } from '../connection-state.server';
import type { SyncInput, SyncMode, SyncResult } from '../types';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function resolveSyncMode(input: SyncInput): SyncMode {
  return input.mode ?? (input.since ? 'incremental' : 'manual');
}

export async function runSyncWithEngine(
  adapter: SourceAdapter,
  input: SyncInput
): Promise<SyncResult> {
  const mode = resolveSyncMode(input);
  const startedAt = new Date().toISOString();

  assertRateLimit(adapter.sourceId);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const syncResult = await adapter.sync({ ...input, mode });
      const rawItems = syncResult.rawItems ?? [];

      let normalized = syncResult.normalized;
      let evidence = syncResult.evidence;
      let rawSaved = syncResult.rawSaved ?? 0;

      if (rawItems.length > 0) {
        const rawSummary = await persistRawSyncItems(adapter.sourceId, rawItems);
        rawSaved += rawSummary.saved;
      }

      const finishedAt = new Date().toISOString();
      const status = syncResult.errors.length > 0 ? 'partial' : 'success';

      await writeConnectionState(adapter.sourceId, {
        lastSyncAt: syncResult.lastSyncAt,
        healthStatus: status === 'success' ? 'healthy' : 'degraded',
        syncCursor: syncResult.lastSyncAt
      });

      await appendSyncLog({
        sourceId: adapter.sourceId,
        mode,
        status,
        startedAt,
        finishedAt,
        fetched: syncResult.fetched,
        normalized,
        evidence,
        errorMessage: syncResult.errors[0]?.message ?? null
      });

      return {
        ...syncResult,
        mode,
        normalized,
        evidence,
        rawSaved,
        status
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Sync failed.');
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const message = lastError?.message ?? 'Sync failed.';

  await writeConnectionState(adapter.sourceId, {
    healthStatus: 'unavailable',
    healthNote: message
  });

  await appendSyncLog({
    sourceId: adapter.sourceId,
    mode,
    status: 'failed',
    startedAt,
    finishedAt,
    fetched: 0,
    normalized: 0,
    evidence: 0,
    errorMessage: message
  });

  return {
    sourceId: adapter.sourceId,
    status: 'failed',
    mode,
    fetched: 0,
    normalized: 0,
    evidence: 0,
    lastSyncAt: finishedAt,
    errors: [{ code: 'sync_failed', message }]
  };
}

/** Scheduled sync hook — cron/worker will call this later. */
export async function runScheduledSync(adapter: SourceAdapter): Promise<SyncResult> {
  return runSyncWithEngine(adapter, {
    sourceId: adapter.sourceId,
    mode: 'scheduled'
  });
}
