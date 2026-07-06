import { getMissingEnvVars, isDataSourceConfigured } from '../env';
import { getDataSourceDefinition } from '../sources';
import type {
  DataSourceId,
  SourceConnector,
  SourceConnectorCapability,
  SourceConnectorFetchResult,
  SourceFetchContext
} from '../types';

type StubConnectorOptions = {
  capabilities?: Partial<SourceConnectorCapability>;
};

export function createStubConnector(source: DataSourceId, options: StubConnectorOptions = {}): SourceConnector {
  const definition = getDataSourceDefinition(source);

  const capabilities: SourceConnectorCapability = {
    canReadPosts: options.capabilities?.canReadPosts ?? true,
    canReadComments: options.capabilities?.canReadComments ?? false,
    canReadMetrics: options.capabilities?.canReadMetrics ?? false
  };

  return {
    meta: {
      source,
      label: definition.label,
      readOnly: true,
      requiredEnvVars: definition.requiredEnvVars,
      capabilities
    },
    isConfigured() {
      return isDataSourceConfigured(source);
    },
    async fetch(context: SourceFetchContext): Promise<SourceConnectorFetchResult> {
      if (source === 'manual_import') {
        const items = (context.manualPayload ?? []).map(item => ({
          source,
          account: context.account,
          externalId: item.externalId,
          rawJson: item.rawJson
        }));
        return { ok: true, items };
      }

      if (!isDataSourceConfigured(source)) {
        const missing = getMissingEnvVars(source);
        return {
          ok: false,
          code: 'not_configured',
          message: `${definition.label} is not configured. Missing env: ${missing.join(', ') || 'unknown'}.`
        };
      }

      return {
        ok: false,
        code: 'needs_auth',
        message: `${definition.label} credentials are present but OAuth is not connected yet. Read-only ingestion will activate after authorization.`
      };
    }
  };
}
