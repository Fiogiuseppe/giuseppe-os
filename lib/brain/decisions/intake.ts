import type { DecisionCategory } from '../../../engine/decisionEngine';
import { classifyDecision } from '../../../engine/decisionEngine';
import type { GiuseppeBrain, LongTermMemory } from '../types';

export type IntakeSlot =
  | 'motivation'
  | 'timeline'
  | 'tradeoff'
  | 'emotional_driver'
  | 'alternatives'
  | 'stakes';

export type DecisionIntakeRequest = {
  decision: string;
  answers?: Record<string, string>;
  locale?: 'it' | 'en';
};

export type DecisionIntakeResponse = {
  status: 'question' | 'ready';
  understandingLevel: 'low' | 'building' | 'sufficient';
  questionsSkipped: number;
  questionsAsked: number;
  category: DecisionCategory;
  question?: {
    id: IntakeSlot;
    text: string;
  };
};

type SlotState = {
  id: IntakeSlot;
  required: boolean;
  satisfied: boolean;
  score: number;
};

const MAX_QUESTIONS = 10;

function combinedText(decision: string, answers: Record<string, string>): string {
  const answerText = Object.values(answers).join(' ');
  return `${decision} ${answerText}`.toLowerCase();
}

function textSatisfiesMotivation(text: string): boolean {
  return (
    text.length > 80 ||
    /perché|perche|motivo|voglio|want|need|spinge|adesso|now|stability|stabilit|libert|freedom|famigl|family/.test(
      text
    )
  );
}

function textSatisfiesTimeline(text: string): boolean {
  return /subito|urgent|settiman|month|mese|anno|year|deadline|scadenza|aspett|wait|90 giorni|30 giorni/.test(
    text
  );
}

function textSatisfiesTradeoff(text: string): boolean {
  return /sacrific|rinunci|trade|cost|runway|liquid|tempo|attention|attenzione|fronte|progett/.test(text);
}

function textSatisfiesEmotional(text: string): boolean {
  return /emotiv|status|impulso|desiderio|paura|ansia|strategic|strateg/.test(text);
}

function textSatisfiesAlternatives(text: string): boolean {
  return /oppure|alternativ|instead|invece di|altra opzione|other option/.test(text);
}

function textSatisfiesStakes(text: string): boolean {
  return /rischio|peggior|worst|se sbagli|if wrong|conseguen|stakes|costo di/.test(text);
}

function memorySatisfiesMotivation(
  category: DecisionCategory,
  longTerm: LongTermMemory,
  text: string
): boolean {
  if (longTerm.decisions.length < 2) return false;
  const similar = longTerm.decisions.filter(row => {
    const rowCategory = classifyDecision(`${row.decision} ${row.reason}`);
    return rowCategory === category && row.reason.trim().length > 12;
  });
  return similar.length >= 1 && text.length > 24;
}

function memoryMaturity(longTerm: LongTermMemory): number {
  return Math.min(28, longTerm.decisions.length * 3 + Math.min(longTerm.lessons.length, 6));
}

function requiredSlots(category: DecisionCategory): IntakeSlot[] {
  switch (category) {
    case 'real_estate':
      return ['motivation', 'timeline', 'tradeoff', 'stakes'];
    case 'emotional_purchase':
      return ['motivation', 'emotional_driver', 'timeline', 'tradeoff'];
    case 'career':
      return ['motivation', 'tradeoff'];
    case 'reputation':
      return ['motivation'];
    case 'creative_project':
      return ['motivation', 'timeline'];
    case 'finance':
      return ['motivation'];
    default:
      return ['motivation', 'stakes'];
  }
}

function optionalSlots(category: DecisionCategory): IntakeSlot[] {
  if (category === 'life_decision') return ['alternatives', 'timeline'];
  if (category === 'career') return ['alternatives'];
  if (category === 'finance') return ['tradeoff'];
  return [];
}

function recommendThreshold(category: DecisionCategory, maturity: number): number {
  const base: Record<DecisionCategory, number> = {
    reputation: 52,
    finance: 54,
    creative_project: 58,
    career: 60,
    emotional_purchase: 66,
    real_estate: 72,
    life_decision: 62
  };
  return Math.max(45, base[category] - Math.floor(maturity / 4));
}

function slotSatisfied(
  slot: IntakeSlot,
  text: string,
  answers: Record<string, string>,
  category: DecisionCategory,
  longTerm: LongTermMemory,
  brain: GiuseppeBrain
): boolean {
  if (answers[slot]?.trim().length > 8) return true;

  switch (slot) {
    case 'motivation':
      return textSatisfiesMotivation(text) || memorySatisfiesMotivation(category, longTerm, text);
    case 'timeline':
      return textSatisfiesTimeline(text);
    case 'tradeoff':
      return (
        textSatisfiesTradeoff(text) ||
        (category === 'finance' && Boolean(brain.finance.liquidity_tier))
      );
    case 'emotional_driver':
      return textSatisfiesEmotional(text);
    case 'alternatives':
      return textSatisfiesAlternatives(text);
    case 'stakes':
      return textSatisfiesStakes(text) || category === 'reputation';
    default:
      return false;
  }
}

function slotScore(slot: IntakeSlot, satisfied: boolean): number {
  if (!satisfied) return 0;
  const weights: Record<IntakeSlot, number> = {
    motivation: 22,
    timeline: 14,
    tradeoff: 16,
    emotional_driver: 14,
    alternatives: 10,
    stakes: 16
  };
  return weights[slot];
}

function questionForSlot(
  slot: IntakeSlot,
  category: DecisionCategory,
  locale: 'it' | 'en'
): string {
  const it: Record<IntakeSlot, string> = {
    motivation: 'Cosa ti spinge a considerarla proprio adesso?',
    timeline: 'C’è urgenza reale — o può aspettare?',
    tradeoff: 'Cosa stai sacrificando se dici sì?',
    emotional_driver: 'È una mossa emotiva o strategica?',
    alternatives: 'Quali alternative stai scartando?',
    stakes: 'Cosa succede se sbagli questa mossa?'
  };

  const en: Record<IntakeSlot, string> = {
    motivation: 'What is pushing you to consider this right now?',
    timeline: 'Is there real urgency — or can it wait?',
    tradeoff: 'What are you giving up if you say yes?',
    emotional_driver: 'Is this an emotional move or a strategic one?',
    alternatives: 'What alternatives are you ruling out?',
    stakes: 'What happens if you get this wrong?'
  };

  const table = locale === 'en' ? en : it;

  if (slot === 'tradeoff' && category === 'career') {
    return locale === 'en'
      ? 'What does this move cost in focus or reputation?'
      : 'Cosa costa questa mossa in focus o reputazione?';
  }

  if (slot === 'motivation' && category === 'reputation') {
    return locale === 'en'
      ? 'What truth do you want this to show about how you think?'
      : 'Quale verità vuoi che mostri su come pensi?';
  }

  return table[slot];
}

function buildSlotStates(
  category: DecisionCategory,
  text: string,
  answers: Record<string, string>,
  longTerm: LongTermMemory,
  brain: GiuseppeBrain
): SlotState[] {
  const required = requiredSlots(category);
  const optional = optionalSlots(category);
  const all = [...required, ...optional];

  return all.map(id => {
    const satisfied = slotSatisfied(id, text, answers, category, longTerm, brain);
    return {
      id,
      required: required.includes(id),
      satisfied,
      score: slotScore(id, satisfied)
    };
  });
}

export function compileDecisionContext(decision: string, answers: Record<string, string>): string {
  const parts = Object.entries(answers)
    .filter(([, value]) => value.trim().length > 0)
    .map(([, value]) => value.trim());

  return parts.length > 0 ? parts.join(' · ') : '';
}

export function runDecisionIntake(
  request: DecisionIntakeRequest,
  brain: GiuseppeBrain,
  longTerm: LongTermMemory
): DecisionIntakeResponse {
  const decision = request.decision.trim();
  const answers = request.answers ?? {};
  const locale = request.locale ?? 'it';
  const text = combinedText(decision, answers);
  const category = classifyDecision(text);
  const maturity = memoryMaturity(longTerm);
  const questionsAsked = Object.keys(answers).length;

  const slots = buildSlotStates(category, text, answers, longTerm, brain);
  const questionsSkipped = slots.filter(slot => slot.satisfied).length;

  let understanding =
    maturity +
    (decision.length > 50 ? 12 : decision.length > 20 ? 6 : 0) +
    slots.reduce((sum, slot) => sum + slot.score, 0);

  const requiredUnsatisfied = slots.filter(slot => slot.required && !slot.satisfied);
  const threshold = recommendThreshold(category, maturity);

  if (
    questionsAsked >= MAX_QUESTIONS ||
    (requiredUnsatisfied.length === 0 && understanding >= threshold) ||
    (understanding >= threshold + 12 && requiredUnsatisfied.length <= 1)
  ) {
    return {
      status: 'ready',
      understandingLevel: 'sufficient',
      questionsSkipped,
      questionsAsked,
      category
    };
  }

  const nextSlot = requiredUnsatisfied[0] ?? slots.find(slot => !slot.satisfied);
  if (!nextSlot) {
    return {
      status: 'ready',
      understandingLevel: 'sufficient',
      questionsSkipped,
      questionsAsked,
      category
    };
  }

  understanding = Math.min(95, understanding);
  const understandingLevel: DecisionIntakeResponse['understandingLevel'] =
    understanding >= threshold - 8 ? 'building' : 'low';

  return {
    status: 'question',
    understandingLevel,
    questionsSkipped,
    questionsAsked,
    category,
    question: {
      id: nextSlot.id,
      text: questionForSlot(nextSlot.id, category, locale)
    }
  };
}
