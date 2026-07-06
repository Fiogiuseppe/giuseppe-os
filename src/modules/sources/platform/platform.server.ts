import type { SourceAction, SourceProviderId, SourceProviderStatus } from '../providers/source-provider.types';
import { getSourceAdapter, isOAuth2Source } from './adapter-registry.server';
import { runSyncWithEngine } from './sync/sync-engine.server';
import type { ConnectResult, SyncInput } from './types';
import { buildSafeProviderStatus, listSafeProviderStatuses } from './engine/source-engine.server';
import { isSourceActive } from '../providers/source-registry';
import { listPersistedSyncRuns } from './engine/sync-run-persistence.server';
import type { SafeSyncRunMetadata } from './engine/sync-run-persistence.server';

export async function listProviderStatuses(): Promise<SourceProviderStatus[]> {
  return listSafeProviderStatuses();
}

export async function connectSource(sourceId: SourceProviderId): Promise<{
  source: SourceProviderStatus;
  message: string;
}> {
  if (!isSourceActive(sourceId)) {
    throw new Error('This source is not available yet.');
  }

  const adapter = getSourceAdapter(sourceId);

  if (adapter.authStrategy === 'oauth2') {
    throw new Error('OAuth sources must connect through the server authorize route.');
  }

  const result = await adapter.connect({ sourceId });

  if (result.outcome !== 'active') {
    throw new Error(result.outcome === 'redirect' ? 'Unexpected OAuth redirect.' : result.message);
  }

  const source = await buildSafeProviderStatus(sourceId);
  return { source, message: result.message };
}

export async function completeOAuthConnect(
  sourceId: SourceProviderId,
  input: { authorizationCode: string; redirectUri: string }
): Promise<SourceProviderStatus> {
  const adapter = getSourceAdapter(sourceId);
  const result = await adapter.connect({
    sourceId,
    authorizationCode: input.authorizationCode,
    redirectUri: input.redirectUri
  });

  if (result.outcome !== 'active') {
    throw new Error(result.outcome === 'pending' ? result.message : 'OAuth connection failed.');
  }

  return buildSafeProviderStatus(sourceId);
}

export async function buildOAuthAuthorizeUrlAsync(
  sourceId: SourceProviderId,
  input: { state: string; redirectUri: string }
): Promise<string> {
  if (!isOAuth2Source(sourceId)) {
    throw new Error('Source does not support OAuth2.');
  }

  const adapter = getSourceAdapter(sourceId);
  const connectResult = await adapter.connect({
    sourceId,
    redirectUri: input.redirectUri,
    oauthState: input.state
  });

  if (connectResult.outcome !== 'redirect') {
    throw new Error(
      connectResult.outcome === 'pending' ? connectResult.message : 'OAuth redirect failed.'
    );
  }

  return connectResult.authorizeUrl;
}

export async function disconnectSource(sourceId: SourceProviderId): Promise<{
  source: SourceProviderStatus;
  message: string;
}> {
  const adapter = getSourceAdapter(sourceId);
  await adapter.disconnect();
  const source = await buildSafeProviderStatus(sourceId);
  return { source, message: `${source.label}: Disconnected.` };
}

export async function syncSource(
  sourceId: SourceProviderId,
  input: Omit<SyncInput, 'sourceId'> = {}
): Promise<{ source: SourceProviderStatus; message: string }> {
  if (!isSourceActive(sourceId)) {
    throw new Error('This source is not available yet.');
  }

  const adapter = getSourceAdapter(sourceId);
  await runSyncWithEngine(adapter, { sourceId, ...input });
  const source = await buildSafeProviderStatus(sourceId);

  if (source.healthStatus === 'unavailable' || source.lastSyncRun?.status === 'failed') {
    return { source, message: source.healthNote ?? `${source.label}: Sync failed.` };
  }

  return { source, message: source.healthNote ?? `${source.label}: Sync completed.` };
}

export async function refreshSource(sourceId: SourceProviderId): Promise<{
  source: SourceProviderStatus;
  message: string;
}> {
  const adapter = getSourceAdapter(sourceId);
  const result = await adapter.refresh();
  const source = await buildSafeProviderStatus(sourceId);
  return { source, message: result.message };
}

export async function applyPlatformAction(
  sourceId: SourceProviderId,
  action: SourceAction
): Promise<{ source: SourceProviderStatus; message: string }> {
  if (action === 'connect') {
    return connectSource(sourceId);
  }

  if (action === 'disconnect') {
    return disconnectSource(sourceId);
  }

  return syncSource(sourceId, { mode: 'manual' });
}

export async function listSourceSyncRuns(
  sourceId: SourceProviderId,
  limit = 20
): Promise<SafeSyncRunMetadata[]> {
  return listPersistedSyncRuns(sourceId, limit);
}

export type { ConnectResult };
