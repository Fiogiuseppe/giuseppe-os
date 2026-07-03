import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import type { GiuseppeBrain, LongTermMemory } from '../brain/types';
import { MAX_BRIEFING_RECOMMENDATIONS } from '../briefing/thinkingChain';
import { MISSION_QUESTION } from '../philosophy/core';
import type { CapitalId } from '../philosophy/core';
import type { RealityReport, RealitySignal } from '../reality/types';
import type { PersonalRelevanceItem, PersonalRelevanceReport, RelevanceDimension } from './types';

const MIN_MATERIAL_SCORE = 12;

interface IdentityContext {
  brain: GiuseppeBrain;
  longTerm: LongTermMemory;
}

interface ScoreResult {
  score: number;
  dimensions: RelevanceDimension[];
  capitals: CapitalId[];
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function addCapital(
  capitals: Set<CapitalId>,
  dimensions: Set<RelevanceDimension>,
  capital: CapitalId,
  dimension: RelevanceDimension,
  score: number,
  bonus = 0
): number {
  capitals.add(capital);
  dimensions.add(dimension);
  return score + bonus;
}

function scoreSignal(signal: RealitySignal, identity: IdentityContext): ScoreResult | null {
  const { brain, longTerm } = identity;
  let score = 0;
  const dimensions = new Set<RelevanceDimension>();
  const capitals = new Set<CapitalId>();
  const text = `${signal.headline} ${signal.summary}`.toLowerCase();

  if (signal.domain === 'personal' && text.includes('priorit')) {
    score = addCapital(capitals, dimensions, 'freedom_capital', 'priorities', score, 40);
    score = addCapital(capitals, dimensions, 'time_capital', 'priorities', score, 8);
  }

  if (signal.domain === 'personal' && text.includes('pattern')) {
    score += 28;
    dimensions.add('patterns');
    capitals.add('freedom_capital');
    capitals.add('time_capital');
  }

  if (signal.domain === 'projects') {
    score += 24;
    dimensions.add('projects');
    if (/visceral|poem|urees|giuseppe os/i.test(text)) {
      score = addCapital(capitals, dimensions, 'creative_capital', 'creative', score, 10);
    }
    if (/lego|brand|medium|linkedin/i.test(text)) {
      score = addCapital(capitals, dimensions, 'reputation_capital', 'career', score, 10);
      capitals.add('wealth_capital');
    }
  }

  if (signal.domain === 'finance' || includesAny(text, brain.finance.main_goals)) {
    score = addCapital(capitals, dimensions, 'wealth_capital', 'finance', score, 20);
    capitals.add('freedom_capital');
  }

  if (includesAny(text, brain.creative_goals) || /visceral|urees|poem/i.test(text)) {
    score = addCapital(capitals, dimensions, 'creative_capital', 'creative', score, 18);
  }

  if (includesAny(text, brain.career_goals) || /lego|creative director|reputazione/i.test(text)) {
    score = addCapital(capitals, dimensions, 'reputation_capital', 'career', score, 16);
    capitals.add('wealth_capital');
  }

  if (includesAny(text, brain.reading_queue) || includesAny(text, brain.skills)) {
    score = addCapital(capitals, dimensions, 'knowledge_capital', 'learning', score, 10);
  }

  if (includesAny(text, brain.contacts)) {
    score = addCapital(capitals, dimensions, 'relationship_capital', 'relationships', score, 8);
  }

  if (includesAny(text, [brain.mission_2036, brain.north_star])) {
    score += 22;
    dimensions.add('mission');
    dimensions.add('north_star');
    capitals.add('freedom_capital');
  }

  if (includesAny(text, brain.values)) {
    score += 12;
    dimensions.add('values');
    capitals.add('freedom_capital');
  }

  for (const decision of longTerm.decisions.slice(-3)) {
    if (includesAny(text, [decision.decision, decision.reason])) {
      score += 14;
      dimensions.add('decisions');
      capitals.add('freedom_capital');
    }
  }

  for (const lesson of longTerm.lessons.slice(-3)) {
    if (includesAny(text, [lesson.lesson])) {
      score += 10;
      dimensions.add('reflections');
      capitals.add('knowledge_capital');
    }
  }

  if (/casa|house|mutuo|mortgage/i.test(text) && !/libert|freedom|runway/i.test(text)) {
    score -= 20;
    dimensions.add('finance');
  }

  if (capitals.size === 0 || score < MIN_MATERIAL_SCORE) {
    return null;
  }

  return {
    score,
    dimensions: Array.from(dimensions),
    capitals: Array.from(capitals)
  };
}

function buildWhyForGiuseppe(
  signal: RealitySignal,
  dimensions: RelevanceDimension[],
  capitals: CapitalId[],
  brain: GiuseppeBrain
): string {
  const hooks: string[] = [];

  if (capitals.includes('wealth_capital')) hooks.push('può migliorare il Wealth Capital');
  if (capitals.includes('knowledge_capital')) hooks.push('può aumentare il Knowledge Capital');
  if (capitals.includes('creative_capital')) hooks.push('può rafforzare il Creative Capital');
  if (capitals.includes('relationship_capital')) hooks.push('può espandere il Relationship Capital');
  if (capitals.includes('health_capital')) hooks.push('può sostenere il Health Capital');
  if (capitals.includes('freedom_capital')) hooks.push('protegge il Freedom Capital');
  if (capitals.includes('time_capital')) hooks.push('protegge il Time Capital');
  if (capitals.includes('reputation_capital')) hooks.push('può elevare il Reputation Capital');
  if (dimensions.includes('priorities')) hooks.push('è in cima alle priorità documentate');
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
  const capitalList = scored.capitals;
  const confidence: PersonalRelevanceItem['confidence'] =
    signal.reliability === 'high' && capitalList.length >= 2
      ? 'high'
      : signal.reliability === 'high'
        ? 'medium'
        : 'low';

  return {
    id: `relevance-${signal.id}`,
    signalId: signal.id,
    headline: signal.headline,
    whyForGiuseppe: buildWhyForGiuseppe(signal, scored.dimensions, capitalList, brain),
    relevanceScore: scored.score,
    confidence,
    dimensions: scored.dimensions,
    capitals: capitalList
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
      if (!scored) return null;
      return toRelevanceItem(signal, scored, brain);
    })
    .filter((item): item is PersonalRelevanceItem => item !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, MAX_BRIEFING_RECOMMENDATIONS);

  const confidenceNote =
    reality.externalFeedsActive === 0
      ? 'Confidenza limitata: nessun feed esterno attivo. Filtro solo memoria documentata attraverso la traiettoria di Giuseppe.'
      : `Filtrati ${ranked.length} segnali ad alta leva su ${reality.signals.length} dalla realtà di oggi.`;

  return {
    generatedAt: new Date().toISOString(),
    items: ranked,
    confidenceNote,
    missionQuestion: MISSION_QUESTION
  };
}
