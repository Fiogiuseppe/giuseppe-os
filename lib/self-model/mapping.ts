import type { DailyBriefingSections } from '../briefing/types';
import type { SelfModelDimensionKey } from './types';

const CATEGORY_DIMENSIONS: Record<string, SelfModelDimensionKey[]> = {
  health: ['health'],
  finance: ['financial_security', 'risk_tolerance'],
  reputation: ['reputation', 'courage', 'consistency'],
  creative: ['creative_energy', 'curiosity'],
  career: ['execution', 'reputation', 'alignment_with_future_self'],
  learning: ['learning', 'curiosity'],
  relationship: ['relationships', 'emotional_clarity'],
  time: ['focus', 'freedom'],
  general: ['alignment_with_future_self', 'focus']
};

const SECTION_DIMENSIONS: Partial<Record<keyof DailyBriefingSections, SelfModelDimensionKey[]>> = {
  oneBigMove: ['execution', 'focus', 'alignment_with_future_self'],
  nourish: ['health', 'creative_energy', 'relationships'],
  opportunity: ['curiosity', 'alignment_with_future_self', 'creative_energy'],
  reflection: ['emotional_clarity', 'learning'],
  reality: ['focus', 'financial_security'],
  ignore: ['risk_tolerance', 'freedom']
};

const PROJECT_STATUS_DIMENSIONS: Record<string, SelfModelDimensionKey[]> = {
  active: ['execution', 'creative_energy', 'focus'],
  'slow-active': ['consistency', 'creative_energy'],
  paused: ['focus', 'freedom'],
  dormant: ['alignment_with_future_self']
};

export function dimensionsForDecisionCategory(category?: string): SelfModelDimensionKey[] {
  if (!category) {
    return CATEGORY_DIMENSIONS.general;
  }

  const normalized = category.toLowerCase();
  return CATEGORY_DIMENSIONS[normalized] ?? CATEGORY_DIMENSIONS.general;
}

export function dimensionsForBriefingSection(
  section?: keyof DailyBriefingSections
): SelfModelDimensionKey[] {
  if (!section) {
    return ['alignment_with_future_self'];
  }

  return SECTION_DIMENSIONS[section] ?? ['alignment_with_future_self'];
}

export function dimensionsForProjectActivity(status: string): SelfModelDimensionKey[] {
  const normalized = status.toLowerCase();
  return PROJECT_STATUS_DIMENSIONS[normalized] ?? ['execution', 'creative_energy'];
}

export function dimensionsForExecutionSignals(): SelfModelDimensionKey[] {
  return ['execution', 'consistency'];
}
