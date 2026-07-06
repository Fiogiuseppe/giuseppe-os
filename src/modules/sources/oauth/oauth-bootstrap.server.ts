import { getOAuthProviderAdapter, registerOAuthProvider } from './oauth-registry.server';
import { createTestOAuthProvider, isTestOAuthProviderEnabled } from './test-oauth-provider.server';

/** Register test-only OAuth providers when running in dev/test mode. */
export function ensureOAuthProvidersBootstrapped(): void {
  if (!isTestOAuthProviderEnabled()) {
    return;
  }

  if (!getOAuthProviderAdapter('test_oauth')) {
    registerOAuthProvider(createTestOAuthProvider());
  }
}
