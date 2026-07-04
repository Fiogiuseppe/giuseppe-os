export { SELF_MODEL_ID, SELF_MODEL_VERSION, SUFFICIENT_EVIDENCE_COUNT, UNKNOWN_ESTIMATE } from './constants';
export { createEmptyDimension, createEmptySelfModel } from './dimensions';
export { hasSufficientEvidence, deriveDimensionEstimate, confidenceFromEvidenceCount } from './estimate';
export { resetSelfModelForTests } from './inMemoryStore';
export {
  dimensionsForBriefingSection,
  dimensionsForDecisionCategory,
  dimensionsForExecutionSignals,
  dimensionsForProjectActivity
} from './mapping';
export { loadSelfModel, saveSelfModel, resolveSelfModelBackend } from './store';
export {
  getLowConfidenceAreas,
  getSelfModelSummary,
  getStrongestPatterns,
  loadLowConfidenceAreas,
  loadSelfModelSummary,
  loadStrongestPatterns
} from './summary';
export {
  updateSelfModelFromDailyBriefFeedback,
  updateSelfModelFromDecision,
  updateSelfModelFromProjectActivity
} from './update';
export type {
  DailyBriefFeedbackInput,
  DecisionOutcomeInput,
  ProjectActivityInput,
  SelfModel,
  SelfModelConfidence,
  SelfModelDimension,
  SelfModelDimensionKey,
  SelfModelPattern,
  SelfModelSummary
} from './types';
export { SELF_MODEL_DIMENSION_KEYS } from './types';
