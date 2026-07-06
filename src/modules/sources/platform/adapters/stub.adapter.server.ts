import { getSourceProvider, isSourceActive } from '../../providers/source-registry';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type { SourceAdapter } from '../adapter.types';
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

export function createStubAdapter(sourceId: SourceProviderId): SourceAdapter {
  const provider = getSourceProvider(sourceId);

  return {
    sourceId,
    authStrategy: 'none',

    async connect(_input: ConnectInput): Promise<ConnectResult> {
      if (!isSourceActive(sourceId)) {
        return { outcome: 'pending', message: FUTURE_NOTE };
      }

      await writeConnectionState(sourceId, {
        connectionStatus: 'connected',
        healthStatus: 'healthy',
        connectedAt: new Date().toISOString(),
        permissionsGranted: grantAllDeclaredPermissions(sourceId),
        healthNote: 'Internal connection — no external API yet (Phase 2 stub).'
      });

      return { outcome: 'active', message: 'Connected (stub adapter).' };
    },

    async disconnect(): Promise<DisconnectResult> {
      await clearConnectionState(sourceId);
      return { disconnected: true, message: 'Disconnected.' };
    },

    async sync(input: SyncInput): Promise<SyncResult> {
      const state = await readConnectionState(sourceId);
      const now = new Date().toISOString();
      const mode = input.mode ?? 'manual';

      if (input.simulateFailure) {
        throw new Error('Simulated sync failure.');
      }

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
        lastSuccessfulSyncAt: now,
        healthStatus: 'healthy',
        healthNote: 'Stub sync completed — no external data fetched yet.'
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
        refreshed: false,
        message: 'No refresh strategy for stub adapter.'
      };
    },

    async health(): Promise<HealthResult> {
      const state = await readConnectionState(sourceId);
      return {
        sourceId,
        status: state?.healthStatus ?? 'unknown',
        connectionStatus: state?.connectionStatus ?? 'disconnected',
        note: state?.healthNote ?? (isSourceActive(sourceId) ? null : FUTURE_NOTE),
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
