import { REALITY_CONNECTOR_REGISTRY } from './connectors/registry';
import type { RealityReport } from './types';

function copenhagenDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(now);
}

export async function runRealityEngine(now = new Date()): Promise<RealityReport> {
  const dateKey = copenhagenDateKey(now);
  const signals = (
    await Promise.all(REALITY_CONNECTOR_REGISTRY.map(connector => connector.collect(dateKey)))
  ).flat();

  const connectors = REALITY_CONNECTOR_REGISTRY.map(connector => connector.meta);
  const externalFeedsActive = connectors.filter(
    connector => connector.status === 'active' && connector.id !== 'personal_context'
  ).length;

  return {
    generatedAt: now.toISOString(),
    dateKey,
    signals,
    connectors,
    externalFeedsActive,
    note:
      externalFeedsActive === 0
        ? 'Nessun feed esterno attivo. Giuseppe OS filtra solo la realtà documentata finché i connettori non sono collegati.'
        : `${externalFeedsActive} feed esterni attivi.`
  };
}
