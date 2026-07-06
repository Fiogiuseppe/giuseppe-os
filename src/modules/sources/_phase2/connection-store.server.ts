import type { SourceAction, SourceProviderId, SourceProviderStatus } from '../providers/source-provider.types';
import {
  applyPlatformAction,
  listProviderStatuses
} from '../platform/platform.server';
import { resetAdapterRegistryForTests } from '../platform/adapter-registry.server';
import { resetConnectionStateForTests } from '../platform/connection-state.server';
import { resetCredentialsVaultForTests } from '../platform/credentials-vault.server';
import { resetOAuthStateForTests } from '../oauth/oauth-state.server';

export async function listSourceStatuses(): Promise<SourceProviderStatus[]> {
  return listProviderStatuses();
}

export async function applySourceAction(
  sourceId: SourceProviderId,
  action: SourceAction
): Promise<SourceProviderStatus> {
  const result = await applyPlatformAction(sourceId, action);
  return result.source;
}

export async function resetConnectionStoreForTests(): Promise<void> {
  await resetConnectionStateForTests();
  resetCredentialsVaultForTests();
  resetAdapterRegistryForTests();
  resetOAuthStateForTests();
}
