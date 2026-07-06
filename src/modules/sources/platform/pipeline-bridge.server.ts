import { ingestFromSource } from '../../../../lib/data-sources/ingest';
import type { DataSourceId } from '../../../../lib/data-sources/types';
import { getSourceProvider } from '../providers/source-registry';
import type { SourceProviderId } from '../providers/source-provider.types';
import type { RawSyncItem } from './types';

/** Maps Sources catalog IDs to data-sources pipeline IDs when aligned. */
const PIPELINE_SOURCE_MAP: Partial<Record<SourceProviderId, DataSourceId>> = {
  instagram_personal: 'instagram',
  instagram_urees: 'instagram',
  linkedin_personal: 'linkedin',
  website_personal: 'website',
  website_urees: 'website',
  medium_personal: 'manual_import'
};

export type PipelineIngestSummary = {
  normalized: number;
  evidence: number;
  errors: Array<{ code: string; message: string }>;
};

/**
 * Provider → Raw Data → Normalization → Evidence → Memory Candidates
 * Bridge into lib/data-sources when a pipeline mapping exists.
 */
export async function ingestSyncItems(
  sourceId: SourceProviderId,
  items: RawSyncItem[]
): Promise<PipelineIngestSummary> {
  const pipelineSource = PIPELINE_SOURCE_MAP[sourceId];
  const summary: PipelineIngestSummary = { normalized: 0, evidence: 0, errors: [] };

  if (!pipelineSource || items.length === 0) {
    return summary;
  }

  const account = items[0]?.account ?? getSourceProvider(sourceId).label;

  try {
    const result = await ingestFromSource(pipelineSource, account, {
      manualPayload: items.map(item => ({
        externalId: item.externalId,
        rawJson: item.rawJson
      })),
      applyToSelfModel: true
    });

    summary.normalized = result.normalized;
    summary.evidence = result.evidence;
    summary.errors = result.errors;
  } catch (error) {
    summary.errors.push({
      code: 'pipeline_ingest_failed',
      message: error instanceof Error ? error.message : 'Pipeline ingest failed.'
    });
  }

  return summary;
}

export const SOURCES_PIPELINE_STAGES = [
  'provider',
  'raw_data',
  'normalization',
  'evidence_storage',
  'memory_candidates',
  'intelligence'
] as const;

export const SOURCES_PIPELINE_DESCRIPTION =
  'Provider → Raw Data → Normalization → Evidence Storage → Memory Candidates → Giuseppe OS Intelligence';
