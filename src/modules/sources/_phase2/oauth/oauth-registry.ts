import type { SourceProviderId } from '../providers/source-provider.types';

/** @deprecated OAuth providers register through platform/adapter-registry.server.ts */
export function getOAuthProvider(id: SourceProviderId) {
  void id;
  throw new Error('Use platform adapter registry instead of oauth-registry.');
}

export { isOAuthSourceProviderId, getOAuthProviderForSource } from './oauth.types';
