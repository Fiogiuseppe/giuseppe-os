import type { DecisionResult } from '../../../engine/decisionEngine';

export type DecisionResponseSource = 'ai' | 'engine' | 'fallback';

export interface DecisionAIResult extends DecisionResult {
  recommendation: string;
  whyItMatters: string;
  boardPerspective: string;
  confidenceScore: number | null;
  confidenceLabel: 'learning' | 'notEnoughData' | 'score';
  source: DecisionResponseSource;
  risks?: string[];
  emotionalBiasCheck?: string;
  alignment?: string;
  missingInformation?: string[];
  provider?: string;
}
