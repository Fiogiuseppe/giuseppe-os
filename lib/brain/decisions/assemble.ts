import type { DecisionResult } from '../../../engine/decisionEngine';
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
  source: DecisionResponseSource;
}): DecisionAIResult {
  const parsed = parseDecisionFieldsFromAnswer(params.answer);
  const boardPerspective = parsed.boardPerspective ?? summarizeBoard(params.engine);

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
    confidenceScore: clampConfidence(parsed.confidenceScore, params.confidence),
    source: params.source
  };
}
