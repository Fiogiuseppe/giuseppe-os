import { SUFFICIENT_EVIDENCE_COUNT, UNKNOWN_ESTIMATE } from './constants';
import type { SelfModelConfidence, SelfModelDimension } from './types';

function positiveSignalCount(notes: string[]): number {
  return notes.filter(note =>
    /positive|strengthen|done\.|would make the same|helpful|active project/i.test(note)
  ).length;
}

function negativeSignalCount(notes: string[]): number {
  return notes.filter(note =>
    /needs attention|weakening|not done|intent without execution|not helpful|weak outcome/i.test(
      note
    )
  ).length;
}

export function confidenceFromEvidenceCount(count: number): SelfModelConfidence {
  if (count >= 6) {
    return 'high';
  }
  if (count >= SUFFICIENT_EVIDENCE_COUNT) {
    return 'medium';
  }
  return 'low';
}

export function deriveDimensionEstimate(dimension: SelfModelDimension): string {
  if (dimension.evidence_count < SUFFICIENT_EVIDENCE_COUNT) {
    return UNKNOWN_ESTIMATE;
  }

  const positives = positiveSignalCount(dimension.notes);
  const negatives = negativeSignalCount(dimension.notes);

  if (positives >= 2 && negatives === 0) {
    return 'strengthening trend from recorded evidence';
  }

  if (negatives >= 2 && positives === 0) {
    return 'needs attention based on recorded evidence';
  }

  if (positives > negatives) {
    return 'leaning positive from recorded evidence';
  }

  if (negatives > positives) {
    return 'mixed signals with friction in recorded evidence';
  }

  return 'stable with limited directional evidence';
}

export function hasSufficientEvidence(dimension: SelfModelDimension): boolean {
  return dimension.evidence_count >= SUFFICIENT_EVIDENCE_COUNT && dimension.current_estimate !== UNKNOWN_ESTIMATE;
}

export function refreshDimensionEstimates(dimension: SelfModelDimension): SelfModelDimension {
  const confidence = confidenceFromEvidenceCount(dimension.evidence_count);
  const current_estimate = deriveDimensionEstimate(dimension);

  return {
    ...dimension,
    confidence,
    current_estimate
  };
}
