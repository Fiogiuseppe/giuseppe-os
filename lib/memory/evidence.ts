export type EvidenceLevel = 'none' | 'learning' | 'emerging' | 'established';

export type EvidenceSnapshot = {
  decisionCount: number;
  lessonCount: number;
  sessionCount: number;
  patternCount: number;
  insightHistoryCount: number;
};

export type EvidenceAssessment = {
  level: EvidenceLevel;
  score: number;
  hasEnoughForConfidence: boolean;
  hasEnoughForInsights: boolean;
  hasEnoughForRanking: boolean;
  observationWindow: 'now' | 'recent_sessions' | 'recent_weeks';
};

const MIN_CONFIDENCE_SCORE = 3;
const MIN_INSIGHT_SCORE = 2;
const MIN_RANKING_SCORE = 4;

export function assessEvidence(snapshot: EvidenceSnapshot): EvidenceAssessment {
  const score =
    snapshot.decisionCount * 2 +
    Math.min(snapshot.lessonCount, 8) +
    Math.min(snapshot.sessionCount, 12) +
    snapshot.patternCount * 2 +
    snapshot.insightHistoryCount;

  let level: EvidenceLevel = 'none';
  if (score >= 12) level = 'established';
  else if (score >= 6) level = 'emerging';
  else if (score >= 1) level = 'learning';

  const observationWindow: EvidenceAssessment['observationWindow'] =
    level === 'established'
      ? 'recent_weeks'
      : level === 'emerging'
        ? 'recent_sessions'
        : 'now';

  return {
    level,
    score,
    hasEnoughForConfidence: score >= MIN_CONFIDENCE_SCORE,
    hasEnoughForInsights: score >= MIN_INSIGHT_SCORE,
    hasEnoughForRanking: score >= MIN_RANKING_SCORE,
    observationWindow
  };
}

export function confidenceFromEvidence(
  assessment: EvidenceAssessment,
  signalStrength: number
): { value: number | null; labelKey: 'learning' | 'notEnoughData' | 'score' } {
  if (!assessment.hasEnoughForConfidence) {
    return assessment.level === 'learning'
      ? { value: null, labelKey: 'learning' }
      : { value: null, labelKey: 'notEnoughData' };
  }

  const base = assessment.level === 'established' ? 62 : assessment.level === 'emerging' ? 55 : 48;
  const value = Math.max(35, Math.min(92, Math.round(base + signalStrength * 4)));
  return { value, labelKey: 'score' };
}

export function formatObservationHeadline(
  window: EvidenceAssessment['observationWindow'],
  locale: 'it' | 'en' = 'it'
): string {
  if (window === 'recent_weeks') {
    return locale === 'it' ? 'Nelle ultime settimane ho notato qualcosa.' : 'Over the last weeks, I noticed something.';
  }
  if (window === 'recent_sessions') {
    return locale === 'it' ? 'Nelle sessioni recenti ho notato qualcosa.' : 'Over recent sessions, I noticed something.';
  }
  return locale === 'it' ? 'Dalla tua costituzione emerge un pattern.' : 'From your constitution, a pattern emerges.';
}
