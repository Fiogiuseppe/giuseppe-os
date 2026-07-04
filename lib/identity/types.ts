/**
 * Identity Layer — sits above Memory.
 * Memory stores facts. Identity stores meaning.
 */

export interface MemoryFact {
  id: string;
  text: string;
  source: 'memory' | 'decision' | 'project' | 'writing' | 'relationship' | 'finance' | 'external';
  observedAt: string;
}

export interface IdentityInterpretation {
  factId: string;
  meaning: string;
  confidence: 'high' | 'medium' | 'low';
  reinterpretedAt: string;
  rationale: string;
}

export interface IdentityLayerReport {
  generatedAt: string;
  facts: MemoryFact[];
  interpretations: IdentityInterpretation[];
  note: string;
}
