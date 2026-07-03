export type RealitySourceKind =
  | 'personal_memory'
  | 'live_reality'
  | 'unknown'
  | 'assumption'
  | 'reliable_external';

export type RealityDomain =
  | 'ai'
  | 'design'
  | 'lego'
  | 'technology'
  | 'creativity'
  | 'business'
  | 'economy'
  | 'art'
  | 'photography'
  | 'science'
  | 'psychology'
  | 'books'
  | 'social_trends'
  | 'personal'
  | 'projects'
  | 'finance';

export type RealityConnectorStatus = 'planned' | 'active';

export interface RealitySignal {
  id: string;
  domain: RealityDomain;
  headline: string;
  summary: string;
  sourceKind: RealitySourceKind;
  connectorId: string;
  reliability: 'high' | 'medium' | 'low';
  observedAt: string;
}

export interface RealityConnectorMeta {
  id: string;
  label: string;
  status: RealityConnectorStatus;
  domains: RealityDomain[];
}

export interface RealityReport {
  generatedAt: string;
  dateKey: string;
  signals: RealitySignal[];
  connectors: RealityConnectorMeta[];
  externalFeedsActive: number;
  note: string;
}

/** @deprecated Use RealitySignal — kept for Executive Brain compatibility */
export type RealityConnectorId =
  | 'news'
  | 'web_search'
  | 'calendar'
  | 'gmail'
  | 'finance'
  | 'weather'
  | 'projects'
  | 'notes'
  | 'personal_context';

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
