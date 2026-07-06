import { listSourceProviders } from '../providers/source-registry';
import type { SourceProviderId } from '../providers/source-provider.types';
import type { AdapterFactory, SourceAdapter } from './adapter.types';
import { createStubAdapter } from './adapters/stub.adapter.server';

const adapterFactories = new Map<SourceProviderId, AdapterFactory>();

function registerAdapter(sourceId: SourceProviderId, factory: AdapterFactory): void {
  adapterFactories.set(sourceId, factory);
}

/** Phase 2: stub adapters only — no external APIs, OAuth, or connectors yet. */
function bootstrapDefaultAdapters(): void {
  if (adapterFactories.size > 0) {
    return;
  }

  for (const provider of listSourceProviders()) {
    registerAdapter(provider.id, () => createStubAdapter(provider.id));
  }
}

export function getSourceAdapter(sourceId: SourceProviderId): SourceAdapter {
  bootstrapDefaultAdapters();

  const factory = adapterFactories.get(sourceId);
  if (!factory) {
    return createStubAdapter(sourceId);
  }

  return factory();
}

export function hasRegisteredAdapter(sourceId: SourceProviderId): boolean {
  bootstrapDefaultAdapters();
  return adapterFactories.has(sourceId);
}

export function listRegisteredAdapterIds(): SourceProviderId[] {
  bootstrapDefaultAdapters();
  return Array.from(adapterFactories.keys());
}

export function isOAuth2Source(_sourceId: SourceProviderId): boolean {
  return false;
}

export function resetAdapterRegistryForTests(): void {
  adapterFactories.clear();
}
