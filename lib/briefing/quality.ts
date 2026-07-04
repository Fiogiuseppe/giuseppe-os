import type { DailyBriefingContext, DailyBriefingSections } from './types';
import { BRIEFING_SILENCE_MESSAGE } from '../philosophy/core';

export type BriefingQualityConfidence = 'high' | 'medium' | 'low';

export interface BriefingQualityReport {
  passed: boolean;
  shouldPublish: boolean;
  confidence: BriefingQualityConfidence;
  relevance: number;
  novelty: number;
  trajectoryImpact: number;
  evidence: number;
  personalization: number;
  issues: string[];
  qualityNote: string;
  silenceRecommended: boolean;
}

const GENERIC_PATTERNS = [
  /stay positive/i,
  /believe in yourself/i,
  /you got this/i,
  /keep going/i,
  /never give up/i,
  /trust the process/i,
  /everything happens for a reason/i,
  /be grateful/i,
  /self[- ]care/i,
  /mindfulness/i,
  /generic advice/i
];

const MISSING_PATTERNS = [/informazione mancante/i, /missing:/i, /nessun segnale/i];

function greetingForDayPart(dayPart: DailyBriefingContext['dayPart']): string {
  switch (dayPart) {
    case 'afternoon':
      return 'Good afternoon Giuseppe.';
    case 'evening':
      return 'Good evening Giuseppe.';
    case 'night':
      return 'Good night Giuseppe.';
    default:
      return 'Good morning Giuseppe.';
  }
}

function includesGenericCopy(text: string): boolean {
  return GENERIC_PATTERNS.some(pattern => pattern.test(text));
}

function includesMissingEvidence(text: string): boolean {
  return MISSING_PATTERNS.some(pattern => pattern.test(text));
}

function scoreSection(text: string): { score: number; issues: string[] } {
  const trimmed = text.trim();
  const issues: string[] = [];
  let score = 0;

  if (trimmed.length < 12) {
    issues.push('section too short');
    return { score: -2, issues };
  }

  score += 1;

  if (includesGenericCopy(trimmed)) {
    issues.push('generic copy detected');
    score -= 3;
  }

  if (includesMissingEvidence(trimmed)) {
    issues.push('missing evidence');
    score -= 2;
  }

  if (trimmed.length >= 40) {
    score += 1;
  }

  return { score, issues };
}

export function evaluateBriefingQuality(
  sections: DailyBriefingSections,
  context: DailyBriefingContext
): BriefingQualityReport {
  const sectionTexts = [
    sections.oneBigMove,
    sections.reality,
    sections.opportunity,
    sections.ignore,
    sections.nourish,
    sections.reflection
  ];

  const issues: string[] = [];
  let relevance = 0;
  let novelty = 0;
  let trajectoryImpact = 0;
  let evidence = 0;
  let personalization = 0;

  sectionTexts.forEach(text => {
    const result = scoreSection(text);
    relevance += Math.max(0, result.score);
    issues.push(...result.issues);
  });

  if (context.relevance.items.length > 0) {
    relevance += 2;
    novelty += 1;
  } else {
    issues.push('no trajectory-approved relevance signals');
    evidence -= 2;
  }

  if (context.trajectory.approvedCount > 0) {
    trajectoryImpact += 2;
  }

  if (context.reality.externalFeedsActive > 0) {
    evidence += 2;
    novelty += 1;
  } else {
    issues.push('no active external reality feeds');
    evidence -= 1;
  }

  if (context.trajectory.filteredCount > 0) {
    trajectoryImpact += 1;
  }

  if (context.relevance.items.length > 0 && context.trajectory.approvedCount > 0) {
    personalization += 2;
  }

  if (context.learningGoals.length > 0) {
    personalization += 1;
  }

  if (context.relevance.items.length === 0) {
    issues.push('low personalization — no Giuseppe-specific relevance signals');
    personalization -= 2;
  }

  const hasGeneric = sectionTexts.some(includesGenericCopy);
  const hasMissing = sectionTexts.some(includesMissingEvidence);
  const moveScore = scoreSection(sections.oneBigMove);

  const passed =
    !hasGeneric &&
    moveScore.score >= 0 &&
    sections.oneBigMove.trim().length >= 12 &&
    sections.reflection.trim().length >= 12;

  const confidence: BriefingQualityConfidence =
    passed && relevance >= 8 && evidence >= 1 && trajectoryImpact >= 2 && personalization >= 2
      ? 'high'
      : passed && relevance >= 4 && personalization >= 0
        ? 'medium'
        : 'low';

  const silenceRecommended =
    confidence === 'low' || hasGeneric || hasMissing || context.relevance.items.length === 0;

  const shouldPublish = passed && !silenceRecommended;

  const qualityNote = shouldPublish
    ? `Quality Engine: briefing approved (${confidence} confidence).`
    : silenceRecommended
      ? 'Quality Engine: confidence too low — silence preferred over weak advice.'
      : 'Quality Engine: briefing failed quality checks.';

  return {
    passed,
    shouldPublish,
    confidence,
    relevance,
    novelty,
    trajectoryImpact,
    evidence,
    personalization,
    issues: Array.from(new Set(issues)),
    qualityNote,
    silenceRecommended
  };
}

export function buildQualitySilenceBriefing(context: DailyBriefingContext): DailyBriefingSections {
  const confidenceNote = context.relevance.confidenceNote;
  return {
    greeting: greetingForDayPart(context.dayPart),
    oneBigMove: BRIEFING_SILENCE_MESSAGE,
    reality:
      context.reality.externalFeedsActive === 0
        ? 'Nessun feed esterno attivo e segnali interni insufficienti per raccomandazioni ad alta leva.'
        : `Confidenza bassa nel briefing di oggi. ${confidenceNote}`,
    opportunity: 'Nessuna opportunità abbastanza forte da meritare attenzione oggi.',
    ignore: 'Ignora il rumore finché non emerge un segnale con evidenza sufficiente.',
    nourish: context.learningGoals[0]
      ? `Se vuoi nutrire qualcosa oggi: ${context.learningGoals[0]}`
      : 'Proteggi energia e attenzione — niente nourish finché la confidenza è bassa.',
    reflection: 'Quale decisione di oggi aumenta la probabilità che tu ti ringrazi tra 10 anni?'
  };
}
