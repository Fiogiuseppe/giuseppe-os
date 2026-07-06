import { getSourceProvider, isSourceActive } from '../../providers/source-registry';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type { SourceConnector } from '../../connectors/types';
import type { SourceAdapter } from '../adapter.types';
import { defaultEnabledDataCollection } from '../models/data-collected';
import { grantAllDeclaredPermissions } from '../models/permissions';
import {
  deletePersistedConnection,
  readPersistedConnection,
  writePersistedConnection
} from '../engine/connection-persistence.server';
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

export function createConnectorAdapter(connector: SourceConnector): SourceAdapter {
  const { sourceId } = connector.meta;
  const provider = getSourceProvider(sourceId);

  return {
    sourceId,
    authStrategy: connector.meta.authStrategy,

    async connect(_input: ConnectInput): Promise<ConnectResult> {
      if (!isSourceActive(sourceId)) {
        return { outcome: 'pending', message: FUTURE_NOTE };
      }

      const result = await connector.connect();
      if (!result.ok) {
        await writePersistedConnection(sourceId, {
          connectionStatus: 'error',
          healthStatus: 'unavailable',
          healthNote: result.message,
          permissionsGranted: [],
          dataCollectionEnabled: [],
          lastSyncAt: null,
          lastSuccessfulSyncAt: null,
          syncCursor: null,
          connectedAt: null
        });
        return { outcome: 'pending', message: result.message };
      }

      const now = new Date().toISOString();
      await writePersistedConnection(sourceId, {
        connectionStatus: 'connected',
        healthStatus: 'healthy',
        healthNote: result.message,
        permissionsGranted: grantAllDeclaredPermissions(sourceId),
        dataCollectionEnabled: defaultEnabledDataCollection(sourceId),
        lastSyncAt: null,
        lastSuccessfulSyncAt: null,
        syncCursor: null,
        connectedAt: now
      });

      return { outcome: 'active', message: result.message };
    },

    async disconnect(): Promise<DisconnectResult> {
      await connector.disconnect();
      await deletePersistedConnection(sourceId);
      return { disconnected: true, message: 'Disconnected.' };
    },

    async sync(input: SyncInput): Promise<SyncResult> {
      const state = await readPersistedConnection(sourceId);
      const mode = input.mode ?? 'manual';
      const now = new Date().toISOString();

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

      const result = await connector.sync({
        mode,
        since: input.since ?? state.syncCursor,
        syncCursor: state.syncCursor
      });

      const lastSyncAt = new Date().toISOString();
      const failed = result.status === 'failed';

      await writePersistedConnection(sourceId, {
        connectionStatus: failed ? 'error' : 'connected',
        healthStatus: failed ? 'unavailable' : result.status === 'partial' ? 'degraded' : 'healthy',
        healthNote: result.message,
        permissionsGranted: state.permissionsGranted,
        dataCollectionEnabled: state.dataCollectionEnabled,
        lastSyncAt,
        lastSuccessfulSyncAt: failed ? state.lastSuccessfulSyncAt : lastSyncAt,
        syncCursor: result.nextSyncCursor ?? lastSyncAt,
        connectedAt: state.connectedAt
      });

      return {
        sourceId,
        status: result.status,
        mode,
        fetched: result.fetched,
        normalized: result.normalized,
        evidence: result.evidence,
        lastSyncAt,
        errors: result.errors,
        rawItems: result.rawItems,
        rawSaved: 0
      };
    },

    async refresh(): Promise<RefreshResult> {
      const health = await connector.health();
      return {
        sourceId,
        refreshed: true,
        message: health.note ?? 'Connector metadata refreshed.'
      };
    },

    async health(): Promise<HealthResult> {
      const state = await readPersistedConnection(sourceId);
      const connectorHealth = await connector.health();

      return {
        sourceId,
        status: state?.healthStatus ?? connectorHealth.status,
        connectionStatus: state?.connectionStatus ?? 'disconnected',
        note: state?.healthNote ?? connectorHealth.note,
        lastSyncAt: state?.lastSyncAt ?? null
      };
    },

    async permissions(): Promise<PermissionsResult> {
      const state = await readPersistedConnection(sourceId);
      return {
        sourceId,
        declared: provider.permissions,
        granted: state?.permissionsGranted ?? []
      };
    }
  };
}
