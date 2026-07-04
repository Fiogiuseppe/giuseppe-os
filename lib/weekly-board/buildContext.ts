import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import { gatherOracleEvidence } from '../oracle/evidence';
import { formatEvidenceForPrompt } from '../oracle/formatEvidence';
import { formatWeeklyEvidencePrompt } from '../oracle/weeklyPrompt';
import type { OracleEvidence } from '../oracle/types';
import { resolveLocale, type AppLocale } from '../i18n/locale';
import type { WeeklyBoardContext } from './types';
import { formatWeekLabel, weeklyBoardWeekKey } from './cache';

const TIMEZONE = 'Europe/Copenhagen';
const LOOKBACK_DAYS = 7;

function weekStartIso(now = new Date()): string {
  const dateKey = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIMEZONE
  }).format(now);

  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() - LOOKBACK_DAYS);
  return utc.toISOString();
}

function filterEvidenceToPastWeek(evidence: OracleEvidence, sinceIso: string): OracleEvidence {
  const decisions = evidence.decisions.records.filter(row => row.timestamp >= sinceIso);
  const decisionIds = new Set(decisions.map(row => row.id));
  const outcomes = evidence.outcomes.records.filter(
    row => row.timestamp >= sinceIso || decisionIds.has(row.decisionId)
  );

  return {
    ...evidence,
    decisions: {
      meta: {
        recordCount: decisions.length,
        insufficientData: decisions.length < 3
      },
      records: decisions
    },
    outcomes: {
      meta: {
        recordCount: outcomes.length,
        insufficientData: outcomes.length < 3
      },
      records: outcomes
    }
  };
}

function isThinEvidence(evidence: OracleEvidence, patterns: string[]): boolean {
  const reviewedOutcomes = evidence.outcomes.records.length;
  const decisions = evidence.decisions.records.length;
  const hasPatterns = patterns.length > 0;
  return reviewedOutcomes === 0 && decisions < 2 && !hasPatterns;
}

export async function buildWeeklyBoardContext(
  localeInput?: AppLocale,
  now = new Date()
): Promise<WeeklyBoardContext> {
  const locale = resolveLocale(localeInput);
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  const sinceIso = weekStartIso(now);
  const fullEvidence = await gatherOracleEvidence(undefined, now);
  const evidence = filterEvidenceToPastWeek(fullEvidence, sinceIso);
  const weekKey = weeklyBoardWeekKey(now);
  const weekLabel = formatWeekLabel(weekKey, locale);
  const patterns = longTerm.patterns_detected.slice(-8);
  const thinEvidence = isThinEvidence(evidence, patterns);

  return {
    generatedAt: now.toISOString(),
    weekKey,
    weekLabel,
    locale,
    northStar: brain.north_star,
    mission: brain.mission_2036,
    priorities: brain.priorities,
    patterns,
    oracleEvidenceBlock: formatWeeklyEvidencePrompt(formatEvidenceForPrompt(evidence), weekLabel),
    evidence: {
      decisions: evidence.decisions.records.length,
      outcomes: evidence.outcomes.records.length,
      patterns: patterns.length,
      streaks: evidence.streaks.items.filter(item => !item.insufficientData).length
    },
    thinEvidence
  };
}
