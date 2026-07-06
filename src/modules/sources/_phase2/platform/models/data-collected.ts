import { getSourceProvider } from '../../providers/source-registry';
import type { SourceProviderId } from '../../providers/source-provider.types';

export type SourceDataCollectedModel = {
  sourceId: SourceProviderId;
  catalog: string[];
  enabled: string[];
};

export function buildDataCollectedModel(
  sourceId: SourceProviderId,
  enabled: string[],
  options?: { connected?: boolean }
): SourceDataCollectedModel {
  const provider = getSourceProvider(sourceId);
  const catalog = provider.dataCollected;
  const resolvedEnabled =
    enabled.length > 0
      ? enabled.filter(item => catalog.includes(item))
      : options?.connected
        ? [...catalog]
        : [];

  return {
    sourceId,
    catalog,
    enabled: resolvedEnabled
  };
}

export function defaultEnabledDataCollection(sourceId: SourceProviderId): string[] {
  return [...getSourceProvider(sourceId).dataCollected];
}
