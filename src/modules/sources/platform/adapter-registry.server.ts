import { listSourceProviders } from '../providers/source-registry';
import type { SourceProviderId } from '../providers/source-provider.types';
import type { AdapterFactory, SourceAdapter } from './adapter.types';
import { createConnectorAdapter } from './adapters/connector.adapter.server';
import { createStubAdapter } from './adapters/stub.adapter.server';
import { getSourceConnector } from '../connectors/registry.server';
import { isOAuthCapableSource } from '../oauth/oauth-registry.server';

const adapterFactories = new Map<SourceProviderId, AdapterFactory>();

function registerAdapter(sourceId: SourceProviderId, factory: AdapterFactory): void {
  adapterFactories.set(sourceId, factory);
}

function bootstrapDefaultAdapters(): void {
  if (adapterFactories.size > 0) {
    return;
  }

  const websiteConnector = getSourceConnector('website_personal');
  if (websiteConnector) {
    registerAdapter('website_personal', () => createConnectorAdapter(websiteConnector));
  }

  const ureesWebsiteConnector = getSourceConnector('website_urees');
  if (ureesWebsiteConnector) {
    registerAdapter('website_urees', () => createConnectorAdapter(ureesWebsiteConnector));
  }

  const mediumConnector = getSourceConnector('medium_personal');
  if (mediumConnector) {
    registerAdapter('medium_personal', () => createConnectorAdapter(mediumConnector));
  }

  for (const provider of listSourceProviders()) {
    if (adapterFactories.has(provider.id)) {
      continue;
    }

    if (isOAuthCapableSource(provider.id)) {
      continue;
    }

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

export function isOAuth2Source(sourceId: SourceProviderId): boolean {
  return isOAuthCapableSource(sourceId);
}

export function resetAdapterRegistryForTests(): void {
  adapterFactories.clear();
}
