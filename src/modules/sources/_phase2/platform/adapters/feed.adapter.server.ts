import { getSourceProvider, isSourceActive } from '../../providers/source-registry';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type { SourceAdapter } from '../adapter.types';
import type { FeedAuthStrategy } from '../auth/types';
import { grantAllDeclaredPermissions } from '../models/permissions';
import {
  clearConnectionState,
  readConnectionState,
  writeConnectionState
} from '../connection-state.server';
import type {
  ConnectInput,
  ConnectResult,
  DisconnectResult,
  HealthResult,
  PermissionsResult,
  RefreshResult,
  SyncInput,
  SyncResult
} from '../types';

const FUTURE_NOTE = 'Planned integration — coming later.';

export function createFeedAdapter(
  sourceId: SourceProviderId,
  strategy?: FeedAuthStrategy
): SourceAdapter {
  const provider = getSourceProvider(sourceId);

  return {
    sourceId,
    authStrategy: 'feed',

    async connect(_input: ConnectInput): Promise<ConnectResult> {
      if (!isSourceActive(sourceId)) {
        return { outcome: 'pending', message: FUTURE_NOTE };
      }

      if (strategy?.validate && provider.profileUrl) {
        const validation = await strategy.validate(provider.profileUrl);
        if (!validation.ok) {
          await writeConnectionState(sourceId, {
            connectionStatus: 'error',
            healthStatus: 'unavailable',
            healthNote: validation.message
          });
          return { outcome: 'pending', message: validation.message };
        }
      }

      const now = new Date().toISOString();
      await writeConnectionState(sourceId, {
        connectionStatus: 'connected',
        healthStatus: 'healthy',
        lastSyncAt: now,
        permissionsGranted: grantAllDeclaredPermissions(sourceId),
        healthNote: 'Public feed monitoring enabled.'
      });

      return { outcome: 'active', message: 'Feed monitoring enabled.' };
    },

    async disconnect(): Promise<DisconnectResult> {
      await clearConnectionState(sourceId);
      return { disconnected: true, message: 'Feed monitoring disabled.' };
    },

    async sync(input: SyncInput): Promise<SyncResult> {
      const state = await readConnectionState(sourceId);
      const now = new Date().toISOString();
      const mode = input.mode ?? 'manual';

      if (state?.connectionStatus !== 'connected') {
        return {
          sourceId,
          status: 'skipped',
          mode,
          fetched: 0,
          normalized: 0,
          evidence: 0,
          lastSyncAt: now,
          errors: [{ code: 'not_connected', message: 'Cannot sync while disconnected.' }]
        };
      }

      await writeConnectionState(sourceId, {
        lastSyncAt: now,
        healthStatus: 'healthy',
        healthNote: 'Feed sync recorded — external fetch Phase 3.'
      });

      return {
        sourceId,
        status: 'success',
        mode,
        fetched: 0,
        normalized: 0,
        evidence: 0,
        lastSyncAt: now,
        errors: []
      };
    },

    async refresh(): Promise<RefreshResult> {
      return {
        sourceId,
        refreshed: true,
        message: 'Feed metadata refreshed.'
      };
    },

    async health(): Promise<HealthResult> {
      const state = await readConnectionState(sourceId);
      return {
        sourceId,
        status: state?.healthStatus ?? 'unknown',
        connectionStatus: state?.connectionStatus ?? 'disconnected',
        note: state?.healthNote ?? null,
        lastSyncAt: state?.lastSyncAt ?? null
      };
    },

    async permissions(): Promise<PermissionsResult> {
      const state = await readConnectionState(sourceId);
      return {
        sourceId,
        declared: provider.permissions,
        granted: state?.permissionsGranted ?? []
      };
    }
  };
}
