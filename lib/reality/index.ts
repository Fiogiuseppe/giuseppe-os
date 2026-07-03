import { runRealityEngine } from './engine';
import type { RealityFact, RealitySnapshot } from './types';

export type {
  RealityConnectorId,
  RealityConnectorMeta,
  RealityConnectorStatus,
  RealityDomain,
  RealityFact,
  RealityReport,
  RealitySignal,
  RealitySnapshot,
  RealitySourceKind
} from './types';

export { REALITY_DOMAINS } from './domains';
export { runRealityEngine } from './engine';
export { registerRealityConnector, REALITY_CONNECTOR_REGISTRY } from './connectors/registry';

/** Legacy bridge for Executive Brain */
export async function fetchRealityContext(_query: string): Promise<RealitySnapshot> {
  const report = await runRealityEngine();
  const facts: RealityFact[] = report.signals.map(signal => ({
    id: signal.id,
    label: signal.headline,
    value: signal.summary,
    sourceKind: signal.sourceKind,
    connector: signal.connectorId as RealityFact['connector'],
    reliability: signal.reliability,
    observedAt: signal.observedAt
  }));

  return {
    facts,
    connectors: report.connectors.map(connector => ({
      id: connector.id as RealityFact['connector'],
      status: connector.status
    }))
  };
}
