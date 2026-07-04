import { DAILY_THINKING_CHAIN } from '../briefing/thinkingChain';
import type { DailyBriefingContext } from '../briefing/types';
import {
  CORE_PHILOSOPHY_PROMPT,
  MISSION_QUESTION,
  REALITY_FILTER_QUESTION,
  TEN_YEAR_QUESTION,
  TRAJECTORY_QUESTION
} from '../philosophy/core';
import { loadBrain } from '../brain/memory/store';
import { runPersonalRelevanceEngine } from '../relevance/engine';
import { runRealityEngine } from '../reality/engine';
import {
  filterRelevanceByTrajectory,
  runTrajectoryEngine
} from '../trajectory/engine';
import { letterDateKey } from './cache';
import { loadConstitutionExcerpt } from './loadConstitution';
import { gatherOracleEvidence } from '../oracle/evidence';
import { formatEvidenceForPrompt } from '../oracle/formatEvidence';
import { buildOracleEvidenceTail } from '../oracle/voiceRules';
import { loadSelfModelSummary } from '../self-model/summary';

function resolveDayPart(hour: number): DailyBriefingContext['dayPart'] {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function formatLocalDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Copenhagen'
  }).format(date);
}

function formatLocalTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(date);
}

export async function buildDailyBriefingContext(now = new Date()): Promise<DailyBriefingContext> {
  const brain = await loadBrain();
  const constitution = await loadConstitutionExcerpt();
  const reality = await runRealityEngine(now);
  const rawRelevance = await runPersonalRelevanceEngine(reality);
  const trajectory = await runTrajectoryEngine({
    constitution,
    mission: brain.mission_2036,
    northStar: brain.north_star,
    values: brain.values,
    patterns: brain.patterns,
    priorities: brain.priorities,
    creativeGoals: brain.creative_goals,
    careerGoals: brain.career_goals,
    financeGoals: brain.finance.main_goals,
    reality,
    relevance: rawRelevance
  });
  const relevance = {
    ...rawRelevance,
    items: filterRelevanceByTrajectory(rawRelevance.items, trajectory)
  };
  const oracle = await gatherOracleEvidence();
  const selfModel = await loadSelfModelSummary();
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Copenhagen' }).format(
      now
    )
  );

  return {
    generatedAt: now.toISOString(),
    localDate: formatLocalDate(now),
    localTime: formatLocalTime(now),
    dayPart: resolveDayPart(hour),
    dateKey: letterDateKey(now),
    constitution,
    mission: brain.mission_2036,
    northStar: brain.north_star,
    values: brain.values,
    patterns: brain.patterns,
    creativeGoals: brain.creative_goals,
    careerGoals: brain.career_goals,
    financeGoals: brain.finance.main_goals,
    learningGoals: brain.reading_queue,
    relationships: brain.contacts,
    activeProjects: Object.entries(brain.projects)
      .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
      .map(([name, project]) => ({ name, role: project.role, status: project.status })),
    priorities: brain.priorities,
    reality,
    relevance,
    trajectory,
    oracle,
    selfModelSummary: selfModel.text
  };
}

/** @deprecated Use buildDailyBriefingContext */
export const buildTodaysLetterContext = buildDailyBriefingContext;

export function formatContextForPrompt(context: DailyBriefingContext): string {
  const projects =
    context.activeProjects.length > 0
      ? context.activeProjects.map(p => `- ${p.name} (${p.status}): ${p.role}`).join('\n')
      : '- MISSING: no active projects documented';

  const relevanceItems =
    context.relevance.items.length > 0
      ? context.relevance.items
          .map(
            item =>
              `- [${item.confidence}] ${item.headline} — ${item.whyForGiuseppe} (capitals: ${item.capitals.join(', ')})`
          )
          .join('\n')
      : '- MISSING: no trajectory-approved relevance signals';

  const trajectoryItems = context.trajectory.evaluations
    .map(
      evaluation =>
        `- [${evaluation.direction}/${evaluation.confidence}] ${evaluation.recommendation} — ${evaluation.rationale}`
    )
    .join('\n');

  return [
    CORE_PHILOSOPHY_PROMPT,
    `TRAJECTORY FILTER: ${TRAJECTORY_QUESTION}`,
    `TEN-YEAR TEST: ${TEN_YEAR_QUESTION}`,
    `MISSION FILTER: ${MISSION_QUESTION}`,
    `REALITY FILTER: ${REALITY_FILTER_QUESTION}`,
    'THINKING CHAIN:',
    ...DAILY_THINKING_CHAIN.map((step, index) => `${index + 1}. ${step}`),
    `DATE: ${context.localDate}`,
    `TIME: ${context.localTime}`,
    'CONSTITUTION:',
    context.constitution,
    `MISSION 2036: ${context.mission || 'MISSING'}`,
    `NORTH STAR: ${context.northStar || 'MISSING'}`,
    `VALUES: ${context.values.join(', ') || 'MISSING'}`,
    `PATTERNS: ${context.patterns.join(' | ') || 'MISSING'}`,
    `CREATIVE GOALS: ${context.creativeGoals.join(' | ') || 'MISSING'}`,
    `CAREER GOALS: ${context.careerGoals.join(' | ') || 'MISSING'}`,
    `FINANCE GOALS: ${context.financeGoals.join(' | ') || 'MISSING'}`,
    `LEARNING GOALS: ${context.learningGoals.join(' | ') || 'MISSING'}`,
    `RELATIONSHIPS: ${context.relationships.join(' | ') || 'MISSING'}`,
    'CURRENT PROJECTS:',
    projects,
    `PRIORITIES: ${context.priorities.join(' | ') || 'MISSING'}`,
    'REALITY ENGINE:',
    context.reality.note,
    `Signals collected: ${context.reality.signals.length}`,
    'PERSONAL RELEVANCE (trajectory-approved):',
    relevanceItems,
    'TRAJECTORY ENGINE:',
    trajectoryItems || '- No trajectory evaluations',
    `TRAJECTORY NOTE: ${context.trajectory.trajectoryNote}`,
    `CONFIDENCE: ${context.relevance.confidenceNote}`,
    '',
    buildOracleEvidenceTail(),
    formatEvidenceForPrompt(context.oracle),
    context.selfModelSummary ? `\n${context.selfModelSummary}` : ''
  ].join('\n');
}
