export type GuardianSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type GuardianCategory =
  | 'architecture'
  | 'performance'
  | 'code-quality'
  | 'ui-consistency'
  | 'ux-consistency'
  | 'accessibility'
  | 'responsive'
  | 'animations'
  | 'typography'
  | 'spacing'
  | 'broken-components'
  | 'unused-components'
  | 'dead-code'
  | 'duplication'
  | 'ai-consistency'
  | 'navigation'
  | 'visual-hierarchy'
  | 'cognitive-load'
  | 'philosophy'
  | 'trust'
  | 'simplicity'
  | 'product'
  | 'security'
  | 'technical-debt';

export interface GuardianFinding {
  id: string;
  category: GuardianCategory;
  severity: GuardianSeverity;
  title: string;
  detail: string;
  why: string;
  recommendation: string;
  file?: string;
}

export interface GuardianDimensionScore {
  id: string;
  label: string;
  score: number;
  summary: string;
}

export interface GuardianReport {
  generatedAt: string;
  version: string;
  overallHealth: number;
  dimensions: GuardianDimensionScore[];
  findings: GuardianFinding[];
  highestPriority: GuardianFinding | null;
  futureRecommendation: string;
  rejectedFeatures: string[];
  finalQuestion: string;
  finalAnswer: string;
}
