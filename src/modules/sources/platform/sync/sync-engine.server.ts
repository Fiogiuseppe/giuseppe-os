import type { SourceAdapter } from '../adapter.types';
import { appendSyncLog } from './sync-log.server';
import { assertRateLimit } from './rate-limiter.server';
import { persistSourceEvidenceItems } from '../engine/source-evidence-persistence.server';
import { extractKnowledgeFromEvidence } from '../../../knowledge/services/knowledge.server';
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
      let knowledgeCreated = 0;
      let knowledgeUpdated = 0;

      if (rawItems.length > 0) {
        const evidenceSummary = await persistSourceEvidenceItems(adapter.sourceId, rawItems);
        rawSaved += evidenceSummary.saved;
        normalized = evidenceSummary.normalized;
        evidence = evidenceSummary.evidence;

        if (evidenceSummary.evidenceItems.length > 0) {
          const knowledgeSummary = await extractKnowledgeFromEvidence({
            sourceId: adapter.sourceId,
            evidence: evidenceSummary.evidenceItems
          });
          knowledgeCreated = knowledgeSummary.created;
          knowledgeUpdated = knowledgeSummary.updated;
        }
      }

      const finishedAt = new Date().toISOString();
      const hasErrors = syncResult.errors.length > 0 || syncResult.status === 'failed';
      const status =
        syncResult.status === 'failed'
          ? 'failed'
          : hasErrors
            ? 'partial'
            : syncResult.status === 'skipped'
              ? 'skipped'
              : 'success';

      const knowledgeNote =
        knowledgeCreated + knowledgeUpdated > 0
          ? `Knowledge: ${knowledgeCreated} created, ${knowledgeUpdated} updated.`
          : '';

      await writeConnectionState(adapter.sourceId, {
        lastSyncAt: syncResult.lastSyncAt,
        lastSuccessfulSyncAt: status === 'success' ? syncResult.lastSyncAt : undefined,
        healthStatus:
          status === 'failed' ? 'unavailable' : status === 'success' ? 'healthy' : 'degraded',
        connectionStatus: status === 'failed' ? 'error' : undefined,
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
        errorMessage: syncResult.errors[0]?.message ?? (knowledgeNote || null),
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
    healthNote: message,
    connectionStatus: 'error'
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
