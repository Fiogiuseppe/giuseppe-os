import fs from 'node:fs';
import path from 'node:path';
import { loadBrain, loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import { gatherOracleEvidence } from '../oracle/evidence';
import { formatEvidenceForPrompt } from '../oracle/formatEvidence';
import { buildOracleEvidenceTail } from '../oracle/voiceRules';
import { resolveLocale, type AppLocale } from '../i18n/locale';
import { loadConstitutionExcerpt } from '../todays-letter/loadConstitution';
import { loadSelfModelSummary } from '../self-model/summary';
import { getKnowledgeStore } from '../../src/modules/knowledge/store';
import { getSourceEngineStore } from '../../src/modules/sources/platform/store';
import type { WeeklyLetterContext, WeeklyLetterEvidence } from './types';
import {
  formatWeekDateRange,
  isTimestampInWeek,
  weekLabelFromKey,
  weekNumberFromKey,
  weeklyLetterWeekKey
} from './week';

const ROOT = process.cwd();

function filterEvidenceToWeek<T extends { timestamp: string }>(records: T[], weekKey: string): T[] {
  return records.filter(row => isTimestampInWeek(row.timestamp, weekKey));
}


function loadLatestGuardianFinding(): { count: number; note: string | null } {
  const reviewsDir = path.join(ROOT, 'docs', 'reviews');
  if (!fs.existsSync(reviewsDir)) {
    return { count: 0, note: null };
  }

  const files = fs
    .readdirSync(reviewsDir)
    .filter(name => name.startsWith('GUARDIAN_REPORT_') && name.endsWith('.md'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return { count: 0, note: null };
  }

  const latest = files[0];
  const stamp = latest.replace('GUARDIAN_REPORT_', '').replace('.md', '');
  const reportWeekStart = new Date(`${stamp}T00:00:00.000Z`);
  const daysSince = (Date.now() - reportWeekStart.getTime()) / 86_400_000;

  if (daysSince > 14) {
    return { count: 0, note: null };
  }

  try {
    const markdown = fs.readFileSync(path.join(reviewsDir, latest), 'utf8');
    const criticalMatch = markdown.match(/## Critical|### Critical|\*\*critical\*\*/i);
    const summaryLine = markdown
      .split('\n')
      .map(line => line.trim())
      .find(line => line.startsWith('- ') || line.startsWith('## '));

    return {
      count: 1,
      note: summaryLine
        ? `Guardian (${stamp}): ${summaryLine.replace(/^#+\s*/, '').replace(/^-\s*/, '')}`
        : criticalMatch
          ? `Guardian (${stamp}): review critical findings before shipping more surface area.`
          : `Guardian report from ${stamp} — no critical findings noted.`
    };
  } catch {
    return { count: 1, note: `Guardian report from ${stamp}.` };
  }
}

function isThinEvidence(evidence: WeeklyLetterEvidence): boolean {
  const signal =
    evidence.decisions +
    evidence.outcomes +
    evidence.dailyBriefs +
    evidence.insights +
    evidence.workingSessions +
    evidence.patterns;
  return signal < 2;
}

export async function buildWeeklyLetterContext(
  localeInput?: AppLocale,
  now = new Date()
): Promise<WeeklyLetterContext> {
  const locale = resolveLocale(localeInput);
  const weekKey = weeklyLetterWeekKey(now);
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  const working = await loadWorkingMemory();
  const constitution = await loadConstitutionExcerpt();
  const selfModel = await loadSelfModelSummary();
  const fullEvidence = await gatherOracleEvidence(undefined, now);

  const weekDecisions = filterEvidenceToWeek(
    fullEvidence.decisions.records.map(row => ({ ...row, timestamp: row.timestamp })),
    weekKey
  );
  const decisionIds = new Set(weekDecisions.map(row => row.id));
  const weekOutcomes = fullEvidence.outcomes.records.filter(
    row => isTimestampInWeek(row.timestamp, weekKey) || decisionIds.has(row.decisionId)
  );

  const weekInsights = (longTerm.insight_history ?? []).filter(row => isTimestampInWeek(row.timestamp, weekKey));
  const weekSessions = working.sessions.filter(row => isTimestampInWeek(row.timestamp, weekKey));
  const patterns = longTerm.patterns_detected.slice(-8);

  let knowledgeItems = 0;
  try {
    const knowledge = await getKnowledgeStore().listByOwner('giuseppe');
    knowledgeItems = knowledge.filter(item => isTimestampInWeek(item.updatedAt, weekKey)).length;
  } catch {
    knowledgeItems = 0;
  }

  let connectedSourceLabels: string[] = [];
  try {
    const connections = await getSourceEngineStore().listConnections();
    connectedSourceLabels = connections
      .filter(row => row.connectionStatus === 'connected')
      .map(row => row.sourceId);
  } catch {
    connectedSourceLabels = [];
  }

  const guardian = loadLatestGuardianFinding();
  const activeProjects = Object.entries(brain.projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .map(([name, project]) => ({ name, role: project.role, status: project.status }));

  const evidence: WeeklyLetterEvidence = {
    decisions: weekDecisions.length,
    outcomes: weekOutcomes.length,
    dailyBriefs: weekSessions.filter(session => session.intent === 'auto' || session.intent === 'reflect').length,
    insights: weekInsights.length,
    projectUpdates: 0,
    guardianReports: guardian.count,
    connectedSources: connectedSourceLabels.length,
    knowledgeItems,
    workingSessions: weekSessions.length,
    patterns: patterns.length
  };

  const filteredEvidence = {
    ...fullEvidence,
    decisions: { meta: fullEvidence.decisions.meta, records: weekDecisions },
    outcomes: { meta: fullEvidence.outcomes.meta, records: weekOutcomes }
  };

  const weekLabel = weekLabelFromKey(weekKey, locale);
  const evidenceBlock = [
    `WEEK: ${weekLabel}`,
    `DATE RANGE: ${formatWeekDateRange(weekKey)}`,
    '',
    'CONSTITUTION (excerpt):',
    constitution,
    '',
    `NORTH STAR: ${brain.north_star || 'MISSING'}`,
    `MISSION: ${brain.mission_2036 || 'MISSING'}`,
    `PRIORITIES: ${brain.priorities.join(' | ') || 'MISSING'}`,
    `PATTERNS IN MEMORY: ${patterns.join(' | ') || 'none'}`,
    '',
    'ACTIVE PROJECTS:',
    activeProjects.length
      ? activeProjects.map(project => `- ${project.name} (${project.status}): ${project.role}`).join('\n')
      : '- none documented',
    '',
    connectedSourceLabels.length
      ? `CONNECTED SOURCES: ${connectedSourceLabels.join(', ')}`
      : 'CONNECTED SOURCES: none',
    '',
    guardian.note ? `GUARDIAN: ${guardian.note}` : 'GUARDIAN: no recent report',
    '',
    selfModel.text ? selfModel.text : 'SELF MODEL: insufficient evidence',
    '',
    'EVIDENCE COUNTS THIS WEEK:',
    `- decisions: ${evidence.decisions}`,
    `- reviewed outcomes: ${evidence.outcomes}`,
    `- working sessions (proxy for daily activity): ${evidence.workingSessions}`,
    `- insights recorded: ${evidence.insights}`,
    `- knowledge updates: ${evidence.knowledgeItems}`,
    '',
    buildOracleEvidenceTail(),
    formatEvidenceForPrompt(filteredEvidence)
  ].join('\n');

  return {
    generatedAt: now.toISOString(),
    weekKey,
    weekNumber: weekNumberFromKey(weekKey),
    dateRange: formatWeekDateRange(weekKey),
    weekLabel,
    locale,
    northStar: brain.north_star,
    mission: brain.mission_2036,
    priorities: brain.priorities,
    patterns,
    activeProjects,
    evidenceBlock,
    evidence,
    thinEvidence: isThinEvidence(evidence),
    guardianNote: guardian.note,
    selfModelSummary: selfModel.text,
    connectedSourceLabels
  };
}
