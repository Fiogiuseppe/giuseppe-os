import { analyzeNormalizedItem } from '../../../../../lib/data-sources/analyze';
import { createEvidenceItem } from '../../../../../lib/data-sources/evidence';
import { normalizeRawSourceItem } from '../../../../../lib/data-sources/normalize';
import { getDataSourceStore } from '../../../../../lib/data-sources/store';
import type { DataSourceId } from '../../../../../lib/data-sources/types';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type { RawSyncItem } from '../types';
import { buildWebsiteContentHash } from '../../connectors/website/configurable-website.fetch.server';

const PIPELINE_SOURCE_MAP: Partial<Record<SourceProviderId, DataSourceId>> = {
  website: 'website',
  'urees-website': 'website'
};

export type SourceEvidencePersistenceSummary = {
  fetched: number;
  saved: number;
  skipped: number;
  normalized: number;
  evidence: number;
  evidenceItems: import('../../../../../lib/data-sources/types').EvidenceItem[];
  errors: Array<{ code: string; message: string }>;
};

function readString(raw: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function isDuplicateRawItem(
  existing: { rawJson: Record<string, unknown> },
  incoming: Record<string, unknown>
): boolean {
  const existingUrl = readString(existing.rawJson, ['url', 'link']);
  const incomingUrl = readString(incoming, ['url', 'link']);
  const existingHash =
    readString(existing.rawJson, ['contentHash']) ||
    buildWebsiteContentHash(
      existingUrl,
      readString(existing.rawJson, ['content', 'description', 'summary'])
    );
  const incomingHash =
    readString(incoming, ['contentHash']) ||
    buildWebsiteContentHash(
      incomingUrl,
      readString(incoming, ['content', 'description', 'summary'])
    );

  return Boolean(existingUrl && incomingUrl && existingUrl === incomingUrl && existingHash === incomingHash);
}

/**
 * Phase 3 — persist raw rows, normalize, and create evidence.
 * Skips duplicates by URL + content hash.
 */
export async function persistSourceEvidenceItems(
  sourceId: SourceProviderId,
  items: RawSyncItem[]
): Promise<SourceEvidencePersistenceSummary> {
  const pipelineSource = PIPELINE_SOURCE_MAP[sourceId];
  const summary: SourceEvidencePersistenceSummary = {
    fetched: items.length,
    saved: 0,
    skipped: 0,
    normalized: 0,
    evidence: 0,
    evidenceItems: [],
    errors: []
  };

  if (!pipelineSource || items.length === 0) {
    return summary;
  }

  const store = getDataSourceStore();

  for (const item of items) {
    try {
      const existing = await store.findRawItem(pipelineSource, item.account, item.externalId);
      if (existing && isDuplicateRawItem(existing, item.rawJson)) {
        summary.skipped += 1;
        continue;
      }

      const raw = await store.saveRawItem({
        source: pipelineSource,
        account: item.account,
        externalId: item.externalId,
        rawJson: {
          ...item.rawJson,
          sourcesProviderId: sourceId,
          ingestedVia: 'sources_engine'
        }
      });
      summary.saved += 1;

      const normalized = normalizeRawSourceItem(raw);
      await store.saveNormalizedItem(normalized);
      summary.normalized += 1;

      const analysis = analyzeNormalizedItem(normalized);
      const evidence = createEvidenceItem(normalized, analysis);
      await store.saveEvidenceItem(evidence);
      summary.evidence += 1;
      summary.evidenceItems.push(evidence);
    } catch (error) {
      summary.errors.push({
        code: 'evidence_save_failed',
        message: error instanceof Error ? error.message : 'Failed to persist source evidence.'
      });
      summary.skipped += 1;
    }
  }

  return summary;
}
