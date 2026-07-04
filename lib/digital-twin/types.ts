/**
 * Digital Twin — probabilistic model of Giuseppe.
 * NOT a profile. NOT raw memory. A living model that evolves weekly.
 * Implementation deferred; types define the contract.
 */

export interface DigitalTwinDimensions {
  identity: string[];
  values: string[];
  beliefs: string[];
  decisionStyle: string[];
  creativeProcess: string[];
  writingStyle: string[];
  communicationStyle: string[];
  energyPatterns: string[];
  stressPatterns: string[];
  learningStyle: string[];
  relationshipPatterns: string[];
  financialBehaviour: string[];
  healthHabits: string[];
  ambitions: string[];
  blindSpots: string[];
  /** Who Giuseppe is, was, is becoming */
  whoGiuseppeIs: string[];
  whoGiuseppeWas: string[];
  whoGiuseppeIsBecoming: string[];
}

export interface DigitalTwinModel {
  version: string;
  updatedAt: string;
  confidence: 'high' | 'medium' | 'low';
  dimensions: DigitalTwinDimensions;
  /** Patterns Giuseppe alone may not consciously notice */
  latentPatterns: string[];
  note: string;
}
