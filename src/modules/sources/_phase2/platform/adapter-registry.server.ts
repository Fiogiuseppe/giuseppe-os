import { listSourceProviders } from '../providers/source-registry';
import type { SourceProviderId } from '../providers/source-provider.types';
import type { AdapterFactory, SourceAdapter } from '../platform/adapter.types';
import { createConnectorAdapter } from '../platform/adapters/connector.adapter.server';
import { createFeedAdapter } from '../platform/adapters/feed.adapter.server';
import { createOAuth2Adapter } from '../platform/adapters/oauth2.adapter.server';
import { createStubAdapter } from '../platform/adapters/stub.adapter.server';
import { getSourceConnector } from '../connectors/registry.server';
import { githubOAuth2Strategy } from '../adapters/github-oauth2.strategy.server';

const adapterFactories = new Map<SourceProviderId, AdapterFactory>();

function registerAdapter(sourceId: SourceProviderId, factory: AdapterFactory): void {
  adapterFactories.set(sourceId, factory);
}

function bootstrapDefaultAdapters(): void {
  if (adapterFactories.size > 0) {
    return;
  }

  registerAdapter('github', () =>
    createOAuth2Adapter({
      sourceId: 'github',
      strategy: githubOAuth2Strategy
    })
  );

  const websiteConnector = getSourceConnector('website');
  if (websiteConnector) {
    registerAdapter('website', () => createConnectorAdapter(websiteConnector));
  }

  for (const provider of listSourceProviders()) {
    if (adapterFactories.has(provider.id)) {
      continue;
    }

    if (provider.authMethod === 'feed') {
      registerAdapter(provider.id, () => createFeedAdapter(provider.id));
      continue;
    }

    if (provider.authMethod === 'oauth') {
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
  return getSourceAdapter(sourceId).authStrategy === 'oauth2';
}

export function resetAdapterRegistryForTests(): void {
  adapterFactories.clear();
}
