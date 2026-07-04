/**
 * Decision Simulator — compare futures before important decisions.
 * Never pretend certainty.
 */

export type DecisionScenarioId = string;

export interface DecisionScenario {
  id: DecisionScenarioId;
  label: string;
  assumptions: string[];
  tradeoffs: string[];
  trajectoryImpact: 'strengthens' | 'weakens' | 'unclear';
  confidence: 'high' | 'medium' | 'low';
}

export interface DecisionSimulationReport {
  generatedAt: string;
  decision: string;
  scenarios: DecisionScenario[];
  comparisonNote: string;
  certaintyDisclaimer: string;
}
