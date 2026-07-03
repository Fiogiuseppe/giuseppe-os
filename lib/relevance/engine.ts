import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import type { GiuseppeBrain, LongTermMemory } from '../brain/types';
import { MISSION_QUESTION } from '../philosophy/core';
import type { OptimizationTargetId } from '../philosophy/core';
import type { RealityReport, RealitySignal } from '../reality/types';
import type { PersonalRelevanceItem, PersonalRelevanceReport, RelevanceDimension } from './types';

const MAX_RELEVANCE_ITEMS = 5;
const MIN_MATERIAL_SCORE = 12;

interface IdentityContext {
  brain: GiuseppeBrain;
  longTerm: LongTermMemory;
}

interface ScoreResult {
  score: number;
  dimensions: RelevanceDimension[];
  optimizationTargets: OptimizationTargetId[];
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function addTarget(
  targets: Set<OptimizationTargetId>,
  dimensions: Set<RelevanceDimension>,
  target: OptimizationTargetId,
  dimension: RelevanceDimension,
  score: number
): number {
  targets.add(target);
  dimensions.add(dimension);
  return score;
}

function scoreSignal(signal: RealitySignal, identity: IdentityContext): ScoreResult | null {
  const { brain, longTerm } = identity;
  let score = 0;
  const dimensions = new Set<RelevanceDimension>();
  const optimizationTargets = new Set<OptimizationTargetId>();
  const text = `${signal.headline} ${signal.summary}`.toLowerCase();

  if (signal.domain === 'personal' && text.includes('priorit')) {
    score += 40;
    score = addTarget(optimizationTargets, dimensions, 'freedom', 'priorities', score);
  }

  if (signal.domain === 'personal' && text.includes('pattern')) {
    score += 28;
    dimensions.add('patterns');
    optimizationTargets.add('freedom');
  }

  if (signal.domain === 'projects') {
    score += 24;
    dimensions.add('projects');
    if (/visceral|poem|urees|giuseppe os/i.test(text)) {
      score = addTarget(optimizationTargets, dimensions, 'creative_legacy', 'creative', score + 8);
    }
    if (/lego|brand|medium|linkedin/i.test(text)) {
      score = addTarget(optimizationTargets, dimensions, 'career_growth', 'career', score + 8);
    }
  }

  if (signal.domain === 'finance' || includesAny(text, brain.finance.main_goals)) {
    score += 20;
    score = addTarget(optimizationTargets, dimensions, 'financial_freedom', 'finance', score);
    optimizationTargets.add('freedom');
  }

  if (includesAny(text, brain.creative_goals) || /visceral|urees|poem/i.test(text)) {
    score += 18;
    score = addTarget(optimizationTargets, dimensions, 'creative_legacy', 'creative', score);
  }

  if (includesAny(text, brain.career_goals) || /lego|creative director|reputazione/i.test(text)) {
    score += 16;
    score = addTarget(optimizationTargets, dimensions, 'career_growth', 'career', score);
  }

  if (includesAny(text, brain.reading_queue) || includesAny(text, brain.skills)) {
    score += 10;
    score = addTarget(optimizationTargets, dimensions, 'knowledge', 'learning', score);
  }

  if (includesAny(text, brain.contacts)) {
    score += 8;
    score = addTarget(optimizationTargets, dimensions, 'network', 'relationships', score);
  }

  if (includesAny(text, [brain.mission_2036, brain.north_star])) {
    score += 22;
    dimensions.add('mission');
    dimensions.add('north_star');
    optimizationTargets.add('freedom');
  }

  if (includesAny(text, brain.values)) {
    score += 12;
    dimensions.add('values');
    optimizationTargets.add('freedom');
  }

  for (const decision of longTerm.decisions.slice(-3)) {
    if (includesAny(text, [decision.decision, decision.reason])) {
      score += 14;
      dimensions.add('decisions');
      optimizationTargets.add('freedom');
    }
  }

  for (const lesson of longTerm.lessons.slice(-3)) {
    if (includesAny(text, [lesson.lesson])) {
      score += 10;
      dimensions.add('reflections');
      optimizationTargets.add('knowledge');
    }
  }

  if (/casa|house|mutuo|mortgage/i.test(text) && !/libert|freedom|runway/i.test(text)) {
    score -= 20;
    dimensions.add('finance');
  }

  if (optimizationTargets.size === 0) {
    return null;
  }

  if (score < MIN_MATERIAL_SCORE) {
    return null;
  }

  return {
    score,
    dimensions: Array.from(dimensions),
    optimizationTargets: Array.from(optimizationTargets)
  };
}

function buildWhyForGiuseppe(
  signal: RealitySignal,
  dimensions: RelevanceDimension[],
  targets: OptimizationTargetId[],
  brain: GiuseppeBrain
): string {
  const hooks: string[] = [];

  if (targets.includes('financial_freedom')) {
    hooks.push('può migliorare la libertà finanziaria');
  }
  if (targets.includes('career_growth')) {
    hooks.push('può accelerare la crescita professionale');
  }
  if (targets.includes('creative_legacy')) {
    hooks.push('può rafforzare il lascito creativo');
  }
  if (targets.includes('network')) {
    hooks.push('può aprire una porta relazionale');
  }
  if (targets.includes('knowledge')) {
    hooks.push('può aumentare il vantaggio cognitivo');
  }
  if (targets.includes('freedom')) {
    hooks.push('protegge la libertà a lungo termine');
  }
  if (dimensions.includes('priorities')) {
    hooks.push('è in cima alle priorità documentate');
  }
  if (dimensions.includes('patterns')) {
    hooks.push('tocca un pattern personale noto');
  }
  if (dimensions.includes('mission') || dimensions.includes('north_star')) {
    hooks.push(`serve la North Star: ${brain.north_star}`);
  }

  if (hooks.length === 0) {
    return `Segnale documentato: ${signal.summary}`;
  }

  return `${signal.summary} — ${hooks.join('; ')}.`;
}

function toRelevanceItem(
  signal: RealitySignal,
  scored: ScoreResult,
  brain: GiuseppeBrain
): PersonalRelevanceItem {
  const dimensionList = scored.dimensions;
  const targetList = scored.optimizationTargets;

  const confidence: PersonalRelevanceItem['confidence'] =
    signal.reliability === 'high' && targetList.length >= 2
      ? 'high'
      : signal.reliability === 'high'
        ? 'medium'
        : 'low';

  return {
    id: `relevance-${signal.id}`,
    signalId: signal.id,
    headline: signal.headline,
    whyForGiuseppe: buildWhyForGiuseppe(signal, dimensionList, targetList, brain),
    relevanceScore: scored.score,
    confidence,
    dimensions: dimensionList,
    optimizationTargets: targetList
  };
}

export async function runPersonalRelevanceEngine(
  reality: RealityReport
): Promise<PersonalRelevanceReport> {
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  const identity = { brain, longTerm };

  const ranked = reality.signals
    .map(signal => {
      const scored = scoreSignal(signal, identity);
      if (!scored) {
        return null;
      }
      return toRelevanceItem(signal, scored, brain);
    })
    .filter((item): item is PersonalRelevanceItem => item !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, MAX_RELEVANCE_ITEMS);

  const confidenceNote =
    reality.externalFeedsActive === 0
      ? 'Confidenza limitata: nessun feed esterno attivo. Filtro solo memoria e contesto documentato attraverso la filosofia Giuseppe OS.'
      : `Filtrati ${ranked.length} segnali materiali su ${reality.signals.length} dalla realtà di oggi.`;

  return {
    generatedAt: new Date().toISOString(),
    items: ranked,
    confidenceNote,
    missionQuestion: MISSION_QUESTION
  };
}
