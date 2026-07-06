import { getSourceConfig } from '../config/source-config';
import type { SourceProviderId } from '../config/source-config';
import { isSourceProviderId } from '../providers/source-registry';
import type { OAuthProviderAdapter } from './oauth-provider.types';

const providerAdapters = new Map<string, OAuthProviderAdapter>();

export function registerOAuthProvider(adapter: OAuthProviderAdapter): void {
  providerAdapters.set(adapter.providerId, adapter);
}

export function getOAuthProviderAdapter(providerId: string): OAuthProviderAdapter | null {
  return providerAdapters.get(providerId) ?? null;
}

export function getOAuthProviderForSource(sourceId: SourceProviderId): OAuthProviderAdapter | null {
  for (const adapter of Array.from(providerAdapters.values())) {
    if (adapter.sourceIds.includes(sourceId)) {
      return adapter;
    }
  }

  return null;
}

export function isOAuthCapableSource(sourceId: string): sourceId is SourceProviderId {
  if (!isSourceProviderId(sourceId)) {
    return false;
  }

  return getSourceConfig(sourceId)?.authMethod === 'oauth';
}

export function listRegisteredOAuthProviderIds(): string[] {
  return Array.from(providerAdapters.keys());
}

export function resetOAuthRegistryForTests(): void {
  providerAdapters.clear();
}
