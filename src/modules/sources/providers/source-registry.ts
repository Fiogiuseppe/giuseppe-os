/**
 * Phase 2 catalog — six sources built from central source-config.
 */
import {
  getSourceConfig,
  isCanonicalSourceId,
  listSourceConfigs,
  normalizeSourceId,
  SOURCE_PROVIDER_IDS,
  type SourceProviderId
} from '../config/source-config';
import type { SourceAvailability, SourceProvider } from './source-provider.types';

export { SOURCE_PROVIDER_IDS, normalizeSourceId };

export function isSourceProviderId(value: string): value is SourceProviderId {
  return normalizeSourceId(value) !== null;
}

export function getSourceProvider(id: SourceProviderId): SourceProvider {
  const config = getSourceConfig(id);
  if (!config) {
    throw new Error(`Unknown source provider: ${id}`);
  }

  return {
    id: config.id,
    label: config.label,
    description: config.description,
    category: 'social',
    group: config.group,
    authMethod: config.authMethod,
    profileUrl: config.officialUrl,
    permissions: config.permissions,
    dataCollected: config.dataCollected
  };
}

export function listSourceProviders(): SourceProvider[] {
  return listSourceConfigs().map(config => getSourceProvider(config.id));
}

export function listProvidersByGroup(groupId: SourceProvider['group']): SourceProvider[] {
  return listSourceProviders().filter(provider => provider.group === groupId);
}

export function isSourceActive(sourceId: SourceProviderId): boolean {
  return isCanonicalSourceId(sourceId);
}

export function getSourceAvailability(sourceId: SourceProviderId): SourceAvailability {
  return isSourceActive(sourceId) ? 'active' : 'future';
}
