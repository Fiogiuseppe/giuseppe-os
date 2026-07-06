import { getSourceProvider } from '../../providers/source-registry';
import type { SourceProviderId } from '../../providers/source-provider.types';
import type { SourceAdapter } from '../adapter.types';
import type { OAuth2Strategy } from '../auth/types';
import { defaultEnabledDataCollection } from '../models/data-collected';
import { defaultGrantedPermissions } from '../models/permissions';
import {
  clearCredentials,
  getCredentials,
  hasCredentials,
  saveCredentials,
  touchCredentialSync
} from '../credentials-vault.server';
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
  OAuth2Credentials,
  PermissionsResult,
  RefreshResult,
  SyncInput,
  SyncResult
} from '../types';

export type OAuth2AdapterConfig = {
  sourceId: SourceProviderId;
  strategy: OAuth2Strategy;
};

export function createOAuth2Adapter(config: OAuth2AdapterConfig): SourceAdapter {
  const { sourceId, strategy } = config;
  const provider = getSourceProvider(sourceId);

  return {
    sourceId,
    authStrategy: 'oauth2',

    async connect(input: ConnectInput): Promise<ConnectResult> {
      if (input.authorizationCode && input.redirectUri) {
        if (!strategy.isConfigured()) {
          return { outcome: 'pending', message: 'OAuth is not configured for this source.' };
        }

        const tokens = await strategy.exchangeCode({
          code: input.authorizationCode,
          redirectUri: input.redirectUri
        });

        saveCredentials(sourceId, {
          kind: 'oauth2',
          accessToken: tokens.accessToken,
          tokenType: tokens.tokenType,
          scope: tokens.scope,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt
        });

        const now = new Date().toISOString();
        await writeConnectionState(sourceId, {
          connectionStatus: 'connected',
          healthStatus: 'healthy',
          lastSyncAt: now,
          permissionsGranted: defaultGrantedPermissions(sourceId),
          healthNote: 'Connected via OAuth — credentials stored server-side only.'
        });

        return { outcome: 'active', message: 'OAuth connection active.' };
      }

      if (!strategy.isConfigured()) {
        return { outcome: 'pending', message: 'OAuth is not configured for this source.' };
      }

      if (!input.redirectUri || !input.oauthState) {
        return { outcome: 'pending', message: 'OAuth redirect URI and state are required.' };
      }

      return {
        outcome: 'redirect',
        authorizeUrl: strategy.buildAuthorizeUrl({
          state: input.oauthState,
          redirectUri: input.redirectUri
        })
      };
    },

    async disconnect(): Promise<DisconnectResult> {
      clearCredentials(sourceId);
      await clearConnectionState(sourceId);
      return { disconnected: true, message: 'OAuth connection removed.' };
    },

    async sync(input: SyncInput): Promise<SyncResult> {
      const now = new Date().toISOString();
      const mode = input.mode ?? 'manual';

      if (!hasCredentials(sourceId)) {
        return {
          sourceId,
          status: 'skipped',
          mode,
          fetched: 0,
          normalized: 0,
          evidence: 0,
          lastSyncAt: now,
          errors: [{ code: 'needs_auth', message: 'OAuth credentials missing.' }]
        };
      }

      const lastSyncAt = touchCredentialSync(sourceId) ?? now;
      await writeConnectionState(sourceId, {
        lastSyncAt,
        healthStatus: 'healthy',
        healthNote: 'OAuth sync requested — ingestion pipeline Phase 3.'
      });

      return {
        sourceId,
        status: 'success',
        mode,
        fetched: 0,
        normalized: 0,
        evidence: 0,
        lastSyncAt,
        errors: []
      };
    },

    async refresh(): Promise<RefreshResult> {
      const record = getCredentials(sourceId);
      if (!record || record.credentials.kind !== 'oauth2') {
        return { sourceId, refreshed: false, message: 'No OAuth credentials to refresh.' };
      }

      if (!strategy.refreshTokens) {
        return { sourceId, refreshed: false, message: 'Refresh not supported for this strategy.' };
      }

      const refreshed = await strategy.refreshTokens(record.credentials as OAuth2Credentials);
      saveCredentials(sourceId, {
        kind: 'oauth2',
        accessToken: refreshed.accessToken,
        tokenType: refreshed.tokenType,
        scope: refreshed.scope,
        refreshToken: refreshed.refreshToken ?? record.credentials.refreshToken,
        expiresAt: refreshed.expiresAt
      });

      return { sourceId, refreshed: true, message: 'OAuth tokens refreshed.' };
    },

    async health(): Promise<HealthResult> {
      const state = await readConnectionState(sourceId);
      const connected = hasCredentials(sourceId);

      return {
        sourceId,
        status: connected ? (state?.healthStatus ?? 'healthy') : 'unknown',
        connectionStatus: connected ? 'connected' : (state?.connectionStatus ?? 'needs_auth'),
        note: state?.healthNote ?? null,
        lastSyncAt: state?.lastSyncAt ?? getCredentials(sourceId)?.lastSyncAt ?? null
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
