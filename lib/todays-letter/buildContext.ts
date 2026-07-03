import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import { publicFinanceSnapshot } from '../brain/memory/publicFinance';
import type { TodaysLetterContext } from './types';

function resolveDayPart(hour: number): TodaysLetterContext['dayPart'] {
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

export async function buildTodaysLetterContext(now = new Date()): Promise<TodaysLetterContext> {
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  const finance = publicFinanceSnapshot(brain);
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
    mission: brain.mission_2036,
    northStar: brain.north_star,
    manifesto: brain.manifesto,
    values: brain.values,
    rules: brain.rules,
    activeProjects: Object.entries(brain.projects)
      .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
      .map(([name, project]) => ({ name, role: project.role, status: project.status })),
    priorities: brain.priorities,
    patterns: brain.patterns,
    financialSummary: {
      liquidityTier: finance.liquidityTier,
      goals: finance.goals
    },
    recentDecisions: longTerm.decisions.slice(-3).map(item => ({
      decision: item.decision,
      reason: item.reason,
      timestamp: item.timestamp
    }))
  };
}

export function formatContextForPrompt(context: TodaysLetterContext): string {
  const projects = context.activeProjects.map(p => `- ${p.name} (${p.status}): ${p.role}`).join('\n');
  const decisions =
    context.recentDecisions.length > 0
      ? context.recentDecisions.map(d => `- ${d.decision}${d.reason ? ` — ${d.reason}` : ''}`).join('\n')
      : '- none recorded yet';

  return [
    `DATE: ${context.localDate}`,
    `TIME: ${context.localTime} (${context.dayPart})`,
    `MISSION 2036: ${context.mission}`,
    `NORTH STAR: ${context.northStar}`,
    `MANIFESTO: ${context.manifesto}`,
    `VALUES: ${context.values.join(' · ')}`,
    `RULES: ${context.rules.join(' | ')}`,
    'ACTIVE PROJECTS:',
    projects,
    `PRIORITIES: ${context.priorities.join(' | ')}`,
    `PATTERNS: ${context.patterns.join(' | ')}`,
    `FINANCE: liquidity ${context.financialSummary.liquidityTier}; goals ${context.financialSummary.goals.join(' | ')}`,
    'RECENT DECISIONS:',
    decisions,
    'Never invent balances. Financial amounts are redacted.'
  ].join('\n');
}
