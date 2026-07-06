import type { SourceProviderId } from '../config/source-config';
import { grantAllDeclaredPermissions } from '../platform/models/permissions';
import { writeConnectionState } from '../platform/connection-state.server';
import {
  resolveOAuthProviderAccountId,
  resolveOAuthProviderSlugForVault
} from './test-oauth-provider.server';
import type { OAuthTokenBundle } from './oauth.types';
import { saveTokenBundleFromOAuth } from '../token-vault/token-vault.server';
import type { SafeTokenMetadata } from '../token-vault/token-vault.types';

/** Persist encrypted tokens and mark the source connection as active — server-side only. */
export async function completeOAuthConnection(input: {
  sourceId: SourceProviderId;
  tokenBundle: OAuthTokenBundle;
  scopes: string[];
}): Promise<SafeTokenMetadata> {
  const metadata = await saveTokenBundleFromOAuth({
    sourceId: input.sourceId,
    provider: resolveOAuthProviderSlugForVault(input.sourceId),
    providerAccountId: resolveOAuthProviderAccountId(input.sourceId),
    tokenBundle: input.tokenBundle
  });

  await writeConnectionState(input.sourceId, {
    connectionStatus: 'connected',
    healthStatus: 'healthy',
    connectedAt: new Date().toISOString(),
    permissionsGranted: grantAllDeclaredPermissions(input.sourceId),
    healthNote: 'Connected via OAuth (test provider).'
  });

  void input.scopes;
  return metadata;
}
