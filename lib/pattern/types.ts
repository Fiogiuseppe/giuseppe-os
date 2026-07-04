/**
 * Pattern Engine — discover patterns Giuseppe cannot easily notice.
 * Patterns are more valuable than memories.
 */

export interface DiscoveredPattern {
  id: string;
  hypothesis: string;
  evidence: string[];
  confidence: 'high' | 'medium' | 'low';
  discoveredAt: string;
  /** e.g. travel → creativity, too many projects → execution drops */
  trigger: string;
  outcome: string;
}

export interface PatternEngineReport {
  generatedAt: string;
  patterns: DiscoveredPattern[];
  note: string;
}
