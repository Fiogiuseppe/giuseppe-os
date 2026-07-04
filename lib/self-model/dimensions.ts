import { SELF_MODEL_ID, SELF_MODEL_VERSION, UNKNOWN_ESTIMATE } from './constants';
import { SELF_MODEL_DIMENSION_KEYS, type SelfModel, type SelfModelDimension } from './types';

export function createEmptyDimension(): SelfModelDimension {
  return {
    current_estimate: UNKNOWN_ESTIMATE,
    confidence: 'low',
    evidence_count: 0,
    last_updated: null,
    evidence_sources: [],
    notes: []
  };
}

export function createEmptySelfModel(now = new Date().toISOString()): SelfModel {
  const dimensions = Object.fromEntries(
    SELF_MODEL_DIMENSION_KEYS.map(key => [key, createEmptyDimension()])
  ) as SelfModel['dimensions'];

  return {
    id: SELF_MODEL_ID,
    version: SELF_MODEL_VERSION,
    updatedAt: now,
    dimensions,
    patterns: []
  };
}
