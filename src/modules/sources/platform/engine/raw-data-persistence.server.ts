import { getDataSourceStore } from '../../../../../lib/data-sources/store';
import type { DataSourceId } from '../../../../../lib/data-sources/types';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type { RawSyncItem } from '../types';

/** Maps Sources catalog IDs to lib/data-sources pipeline IDs. */
const RAW_SOURCE_MAP: Partial<Record<SourceProviderId, DataSourceId>> = {
  website: 'website',
  medium: 'manual_import',
  'urees-website': 'manual_import'
};

export type RawPersistenceSummary = {
  saved: number;
  skipped: number;
  errors: Array<{ code: string; message: string }>;
};

/**
 * Phase 3: persist raw rows only.
 * Normalization → evidence is Phase 6 (see docs/SOURCES_ROADMAP.md).
 */
export async function persistRawSyncItems(
  sourceId: SourceProviderId,
  items: RawSyncItem[]
): Promise<RawPersistenceSummary> {
  const pipelineSource = RAW_SOURCE_MAP[sourceId];
  const summary: RawPersistenceSummary = { saved: 0, skipped: 0, errors: [] };

  if (!pipelineSource || items.length === 0) {
    return summary;
  }

  const store = getDataSourceStore();

  for (const item of items) {
    try {
      await store.saveRawItem({
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
    } catch (error) {
      summary.errors.push({
        code: 'raw_save_failed',
        message: error instanceof Error ? error.message : 'Failed to save raw item.'
      });
      summary.skipped += 1;
    }
  }

  return summary;
}
