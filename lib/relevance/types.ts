import type { OptimizationTargetId } from '../philosophy/core';

export type RelevanceDimension =
  | 'mission'
  | 'north_star'
  | 'values'
  | 'projects'
  | 'priorities'
  | 'patterns'
  | 'career'
  | 'creative'
  | 'finance'
  | 'learning'
  | 'relationships'
  | 'health'
  | 'decisions'
  | 'reflections';

export interface PersonalRelevanceItem {
  id: string;
  signalId: string;
  headline: string;
  whyForGiuseppe: string;
  relevanceScore: number;
  confidence: 'high' | 'medium' | 'low';
  dimensions: RelevanceDimension[];
  optimizationTargets: OptimizationTargetId[];
}

export interface PersonalRelevanceReport {
  generatedAt: string;
  items: PersonalRelevanceItem[];
  confidenceNote: string;
  missionQuestion: string;
}
