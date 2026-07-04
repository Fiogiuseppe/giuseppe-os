import { SUFFICIENT_EVIDENCE_COUNT, UNKNOWN_ESTIMATE } from './constants';
import { hasSufficientEvidence } from './estimate';
import { loadSelfModel } from './store';
import type { SelfModel, SelfModelDimensionKey, SelfModelPattern, SelfModelSummary } from './types';
import { SELF_MODEL_DIMENSION_KEYS } from './types';

function formatDimensionLabel(key: SelfModelDimensionKey): string {
  return key.replaceAll('_', ' ');
}

export function getLowConfidenceAreas(model: SelfModel): SelfModelDimensionKey[] {
  return SELF_MODEL_DIMENSION_KEYS.filter(key => {
    const dimension = model.dimensions[key];
    return dimension.confidence === 'low' || dimension.current_estimate === UNKNOWN_ESTIMATE;
  });
}

export function getStrongestPatterns(model: SelfModel): SelfModelPattern[] {
  return [...model.patterns].sort((left, right) => right.evidence_count - left.evidence_count).slice(0, 5);
}

export function getSelfModelSummary(model: SelfModel): SelfModelSummary {
  const evidencedDimensions = SELF_MODEL_DIMENSION_KEYS.filter(key => hasSufficientEvidence(model.dimensions[key]));
  const lowConfidenceCount = getLowConfidenceAreas(model).length;
  const patterns = getStrongestPatterns(model);

  if (evidencedDimensions.length === 0 && patterns.length === 0) {
    return {
      text: '',
      dimensionsWithEvidence: 0,
      lowConfidenceCount,
      patternCount: patterns.length
    };
  }

  const dimensionLines = evidencedDimensions.map(key => {
    const dimension = model.dimensions[key];
    return `- ${formatDimensionLabel(key)}: ${dimension.current_estimate} (${dimension.evidence_count} evidence points, confidence ${dimension.confidence})`;
  });

  const patternLines = patterns
    .filter(pattern => pattern.evidence_count >= SUFFICIENT_EVIDENCE_COUNT)
    .map(pattern => `- ${pattern.pattern} (${pattern.evidence_count} evidence points)`);

  const uncertaintyNote =
    lowConfidenceCount > 0
      ? `Uncertainty note: ${lowConfidenceCount} dimensions remain low-confidence or not yet evidenced — do not state them as facts.`
      : 'Uncertainty note: only dimensions with sufficient evidence are listed below.';

  const sections = [
    'SELF MODEL (evidence-backed only — never invent beyond this block):',
    uncertaintyNote,
    dimensionLines.length > 0 ? 'Observed dimensions:' : null,
    ...dimensionLines,
    patternLines.length > 0 ? 'Observed patterns:' : null,
    ...patternLines
  ].filter((line): line is string => Boolean(line));

  return {
    text: sections.join('\n'),
    dimensionsWithEvidence: evidencedDimensions.length,
    lowConfidenceCount,
    patternCount: patterns.length
  };
}

export async function loadSelfModelSummary(): Promise<SelfModelSummary> {
  const model = await loadSelfModel();
  return getSelfModelSummary(model);
}

export async function loadLowConfidenceAreas(): Promise<SelfModelDimensionKey[]> {
  const model = await loadSelfModel();
  return getLowConfidenceAreas(model);
}

export async function loadStrongestPatterns(): Promise<SelfModelPattern[]> {
  const model = await loadSelfModel();
  return getStrongestPatterns(model);
}
