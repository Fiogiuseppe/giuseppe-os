import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import type { GiuseppeBrain, LongTermMemory } from '../brain/types';
import type { RealityReport, RealitySignal } from '../reality/types';
import type { PersonalRelevanceItem, PersonalRelevanceReport, RelevanceDimension } from './types';

const MAX_RELEVANCE_ITEMS = 5;

interface IdentityContext {
  brain: GiuseppeBrain;
  longTerm: LongTermMemory;
}

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function scoreSignal(signal: RealitySignal, identity: IdentityContext): PersonalRelevanceItem | null {
  const { brain, longTerm } = identity;
  let score = 0;
  const dimensions = new Set<RelevanceDimension>();
  const text = `${signal.headline} ${signal.summary}`.toLowerCase();

  if (signal.domain === 'personal' && text.includes('priorit')) {
    score += 40;
    dimensions.add('priorities');
  }

  if (signal.domain === 'personal' && text.includes('pattern')) {
    score += 28;
    dimensions.add('patterns');
  }

  if (signal.domain === 'projects') {
    score += 24;
    dimensions.add('projects');
  }

  if (signal.domain === 'finance') {
    score += 20;
    dimensions.add('finance');
  }

  if (includesAny(text, brain.creative_goals)) {
    score += 18;
    dimensions.add('creative');
  }

  if (includesAny(text, brain.career_goals)) {
    score += 16;
    dimensions.add('career');
  }

  if (includesAny(text, brain.reading_queue)) {
    score += 10;
    dimensions.add('learning');
  }

  if (includesAny(text, brain.contacts)) {
    score += 8;
    dimensions.add('relationships');
  }

  if (includesAny(text, [brain.mission_2036, brain.north_star])) {
    score += 22;
    dimensions.add('mission');
    dimensions.add('north_star');
  }

  if (includesAny(text, brain.values)) {
    score += 12;
    dimensions.add('values');
  }

  for (const decision of longTerm.decisions.slice(-3)) {
    if (includesAny(text, [decision.decision, decision.reason])) {
      score += 14;
      dimensions.add('decisions');
    }
  }

  for (const lesson of longTerm.lessons.slice(-3)) {
    if (includesAny(text, [lesson.lesson])) {
      score += 10;
      dimensions.add('reflections');
    }
  }

  if (dimensions.size === 0 && signal.reliability === 'high') {
    score += 8;
    dimensions.add('priorities');
  }

  if (score === 0) {
    return null;
  }

  const dimensionList = Array.from(dimensions);

  const confidence: PersonalRelevanceItem['confidence'] =
    signal.reliability === 'high' && dimensionList.length >= 2
      ? 'high'
      : signal.reliability === 'high'
        ? 'medium'
        : 'low';

  return {
    id: `relevance-${signal.id}`,
    signalId: signal.id,
    headline: signal.headline,
    whyForGiuseppe: buildWhyForGiuseppe(signal, dimensionList, brain),
    relevanceScore: score,
    confidence,
    dimensions: dimensionList
  };
}

function buildWhyForGiuseppe(
  signal: RealitySignal,
  dimensions: RelevanceDimension[],
  brain: GiuseppeBrain
): string {
  const hooks: string[] = [];

  if (dimensions.includes('priorities')) {
    hooks.push('è in cima alle priorità documentate');
  }
  if (dimensions.includes('patterns')) {
    hooks.push('tocca un pattern personale noto');
  }
  if (dimensions.includes('mission') || dimensions.includes('north_star')) {
    hooks.push(`serve la North Star: ${brain.north_star}`);
  }
  if (dimensions.includes('creative')) {
    hooks.push('avvicina gli obiettivi creativi');
  }
  if (dimensions.includes('finance')) {
    hooks.push('riguarda la libertà finanziaria');
  }
  if (dimensions.includes('projects')) {
    hooks.push('coinvolge un progetto attivo');
  }

  if (hooks.length === 0) {
    return `Segnale documentato: ${signal.summary}`;
  }

  return `${signal.summary} — ${hooks.join('; ')}.`;
}

export async function runPersonalRelevanceEngine(
  reality: RealityReport
): Promise<PersonalRelevanceReport> {
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  const identity = { brain, longTerm };

  const ranked = reality.signals
    .map(signal => scoreSignal(signal, identity))
    .filter((item): item is PersonalRelevanceItem => item !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, MAX_RELEVANCE_ITEMS);

  const confidenceNote =
    reality.externalFeedsActive === 0
      ? 'Confidenza limitata: nessun feed esterno attivo. Giuseppe OS filtra solo memoria e contesto documentato.'
      : `Filtrati ${ranked.length} segnali su ${reality.signals.length} dalla realtà di oggi.`;

  return {
    generatedAt: new Date().toISOString(),
    items: ranked,
    confidenceNote
  };
}
