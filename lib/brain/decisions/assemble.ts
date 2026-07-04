import type { DecisionResult } from '../../../engine/decisionEngine';
import type { EvidenceAssessment } from '../../memory/evidence';
import { confidenceFromEvidence } from '../../memory/evidence';
import type { DecisionAIResult, DecisionResponseSource } from './types';
import { parseDecisionFieldsFromAnswer, summarizeBoard } from './parse';

function clampConfidence(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return Math.round(fallback * 100);
  }
  return Math.max(0, Math.min(100, value > 1 ? Math.round(value) : Math.round(value * 100)));
}

export function assembleDecisionAIResult(params: {
  engine: DecisionResult;
  answer: string;
  confidence: number;
  evidenceAssessment?: EvidenceAssessment;
  source: DecisionResponseSource;
}): DecisionAIResult {
  const parsed = parseDecisionFieldsFromAnswer(params.answer);
  const boardPerspective = parsed.boardPerspective ?? summarizeBoard(params.engine);
  const gated = params.evidenceAssessment
    ? confidenceFromEvidence(params.evidenceAssessment, 3)
    : null;

  const confidenceScore =
    gated && gated.labelKey !== 'score'
      ? null
      : gated?.value ?? clampConfidence(parsed.confidenceScore, params.confidence);

  return {
    ...params.engine,
    categoryLabel: parsed.categoryLabel ?? params.engine.categoryLabel,
    hiddenNeed: parsed.hiddenNeed ?? params.engine.hiddenNeed,
    bias: parsed.bias ?? params.engine.bias,
    betterVersion: parsed.betterVersion ?? params.engine.betterVersion,
    nextAction: parsed.nextAction ?? params.engine.nextAction,
    recommendation: parsed.recommendation ?? params.engine.betterVersion ?? params.engine.nextAction,
    whyItMatters:
      parsed.whyItMatters ??
      `Questa scelta tocca la North Star di Giuseppe: ${params.engine.betterVersion}`,
    boardPerspective,
    confidenceScore,
    confidenceLabel: gated?.labelKey ?? (confidenceScore !== null ? 'score' : 'notEnoughData'),
    source: params.source
  };
}
