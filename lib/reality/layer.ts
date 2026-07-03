export type RealitySourceKind =
  | 'personal_memory'
  | 'live_reality'
  | 'unknown'
  | 'assumption'
  | 'reliable_external';

export type RealityConnectorId =
  | 'news'
  | 'web_search'
  | 'calendar'
  | 'gmail'
  | 'finance'
  | 'weather'
  | 'projects'
  | 'notes';

export interface RealityFact {
  id: string;
  label: string;
  value: string;
  sourceKind: RealitySourceKind;
  connector: RealityConnectorId;
  reliability: 'high' | 'medium' | 'low';
  observedAt: string;
}

export interface RealitySnapshot {
  facts: RealityFact[];
  connectors: Array<{
    id: RealityConnectorId;
    status: 'planned' | 'active';
  }>;
}

export interface RealityConnector {
  id: RealityConnectorId;
  status: 'planned' | 'active';
  fetch(_query: string): Promise<RealityFact[]>;
}

function plannedConnector(id: RealityConnectorId): RealityConnector {
  return {
    id,
    status: 'planned',
    async fetch() {
      return [];
    }
  };
}

export const REALITY_CONNECTORS: RealityConnector[] = [
  plannedConnector('news'),
  plannedConnector('web_search'),
  plannedConnector('calendar'),
  plannedConnector('gmail'),
  plannedConnector('finance'),
  plannedConnector('weather'),
  plannedConnector('projects'),
  plannedConnector('notes')
];

export async function fetchRealityContext(query: string): Promise<RealitySnapshot> {
  const facts: RealityFact[] = [];

  for (const connector of REALITY_CONNECTORS) {
    const connectorFacts = await connector.fetch(query);
    facts.push(...connectorFacts);
  }

  return {
    facts,
    connectors: REALITY_CONNECTORS.map(connector => ({
      id: connector.id,
      status: connector.status
    }))
  };
}
