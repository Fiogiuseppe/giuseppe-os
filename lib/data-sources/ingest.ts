import { analyzeNormalizedItem } from './analyze';
import { getSourceConnector } from './connectors/registry';
import { createEvidenceItem } from './evidence';
import { isDataSourceConfigured } from './env';
import { normalizeRawSourceItem } from './normalize';
import { applyEvidenceToSelfModel } from './self-model-bridge';
import { getDataSourceDefinition } from './sources';
import { getDataSourceStore } from './store';
import type {
  DataSourceAuthStatus,
  DataSourceId,
  EvidenceItem,
  SourceFetchContext,
  SourceIngestionResult
} from './types';
import { DATA_SOURCE_IDS } from './types';

export type IngestFromSourceOptions = {
  since?: string;
  limit?: number;
  manualPayload?: SourceFetchContext['manualPayload'];
  applyToSelfModel?: boolean;
};

function resolveAuthStatus(source: DataSourceId, connectorConfigured: boolean, fetchOk: boolean): DataSourceAuthStatus {
  if (fetchOk) {
    return 'connected';
  }

  if (!connectorConfigured) {
    return 'needs_auth';
  }

  return 'needs_auth';
}

export async function ingestFromSource(
  source: DataSourceId,
  account: string,
  options: IngestFromSourceOptions = {}
): Promise<SourceIngestionResult> {
  const connector = getSourceConnector(source);
  const store = getDataSourceStore();
  const definition = getDataSourceDefinition(source);
  const result: SourceIngestionResult = {
    source,
    account,
    fetched: 0,
    normalized: 0,
    evidence: 0,
    skipped: 0,
    errors: []
  };

  const fetchResult = await connector.fetch({
    account,
    since: options.since,
    limit: options.limit,
    manualPayload: options.manualPayload
  });

  if (!fetchResult.ok) {
    result.errors.push({ code: fetchResult.code, message: fetchResult.message });
    await store.upsertDataSource({
      id: `ds_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}`,
      source,
      account,
      label: definition.label,
      authStatus: resolveAuthStatus(source, connector.isConfigured(), false),
      lastSyncAt: new Date().toISOString()
    });
    return result;
  }

  const evidenceBatch: EvidenceItem[] = [];

  for (const item of fetchResult.items) {
    result.fetched += 1;

    const raw = await store.saveRawItem({
      source: item.source,
      account: item.account,
      externalId: item.externalId,
      rawJson: item.rawJson
    });

    const normalized = normalizeRawSourceItem(raw);
    await store.saveNormalizedItem(normalized);
    result.normalized += 1;

    const analysis = analyzeNormalizedItem(normalized);
    const evidence = createEvidenceItem(normalized, analysis);
    await store.saveEvidenceItem(evidence);
    evidenceBatch.push(evidence);
    result.evidence += 1;
  }

  await store.upsertDataSource({
    id: `ds_${source}_${account.replace(/[^a-zA-Z0-9]+/g, '_')}`,
    source,
    account,
    label: definition.label,
    authStatus: resolveAuthStatus(source, connector.isConfigured(), fetchResult.items.length > 0),
    lastSyncAt: new Date().toISOString()
  });

  if (options.applyToSelfModel !== false && evidenceBatch.length > 0) {
    await applyEvidenceToSelfModel(evidenceBatch);
  }

  return result;
}

export function listConfiguredSources(): Array<{ source: DataSourceId; configured: boolean }> {
  return DATA_SOURCE_IDS.map(source => ({
    source,
    configured: isDataSourceConfigured(source)
  }));
}
