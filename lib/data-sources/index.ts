export { analyzeNormalizedItem } from './analyze';
export type { SourceAnalysis } from './analyze';
export { getSourceConnector, listSourceConnectors, resetSourceConnectorRegistryForTests } from './connectors/registry';
export { getMissingEnvVars, isDataSourceConfigured, isEnvVarPresent } from './env';
export { createEvidenceItem, buildEvidenceAttribution, buildEvidenceTraceId } from './evidence';
export { ingestFromSource, listConfiguredSources } from './ingest';
export type { IngestFromSourceOptions } from './ingest';
export { normalizeRawSourceItem } from './normalize';
export { DATA_SOURCE_PIPELINE, DATA_SOURCE_PIPELINE_DESCRIPTION } from './pipeline';
export { applyEvidenceToSelfModel } from './self-model-bridge';
export { DATA_SOURCE_DEFINITIONS, getDataSourceDefinition } from './sources';
export { getDataSourceStore, resetInMemoryDataSourceStoreForTests } from './store';
export type {
  DataSourceStore,
  DataSourceStoreBackend,
  SaveEvidenceItemInput,
  SaveNormalizedSourceItemInput,
  SaveRawSourceItemInput,
  UpsertDataSourceInput
} from './store';
export {
  DATA_SOURCE_IDS,
  type DataSource,
  type DataSourceAuthStatus,
  type DataSourceId,
  type DataSourcePipelineStage,
  type EvidenceConfidence,
  type EvidenceItem,
  type NormalizedSourceItem,
  type NormalizedSourceItemKind,
  type RawSourceItem,
  type SourceConnector,
  type SourceConnectorCapability,
  type SourceConnectorErrorCode,
  type SourceConnectorFetchResult,
  type SourceConnectorMeta,
  type SourceFetchContext,
  type SourceIngestionError,
  type SourceIngestionResult,
  type SourceMetrics
} from './types';
