import { loadBrain } from '../brain/memory/store';
import { letterDateKey } from './cache';
import { loadConstitutionExcerpt } from './loadConstitution';
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
  const constitution = await loadConstitutionExcerpt();
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
    activeProjects: Object.entries(brain.projects)
      .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
      .map(([name, project]) => ({ name, role: project.role, status: project.status })),
    priorities: brain.priorities
  };
}

export function formatContextForPrompt(context: TodaysLetterContext): string {
  const projects =
    context.activeProjects.length > 0
      ? context.activeProjects.map(p => `- ${p.name} (${p.status}): ${p.role}`).join('\n')
      : '- MISSING: no active projects documented';

  const priorities =
    context.priorities.length > 0
      ? context.priorities.join(' | ')
      : 'MISSING: no priorities documented';

  return [
    `DATE: ${context.localDate}`,
    `TIME: ${context.localTime}`,
    'CONSTITUTION:',
    context.constitution,
    `MISSION 2036: ${context.mission || 'MISSING'}`,
    `NORTH STAR: ${context.northStar || 'MISSING'}`,
    'CURRENT PROJECTS:',
    projects,
    `PRIORITIES: ${priorities}`
  ].join('\n');
}
