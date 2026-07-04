import { loadGiuseppeIdentityPrompt, buildAppContextBlock } from '../ai/app-context';
import {
  buildIdentitySlice,
  buildPatternsSlice,
  buildProjectsSlice
} from '../brain/context/slices';
import { loadBrain, loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import type { TodayContext } from './types';
import { todayDateKey } from './cache';

function formatRecentSessions(
  sessions: Awaited<ReturnType<typeof loadWorkingMemory>>['sessions']
): string {
  const recent = sessions.slice(-4);
  if (!recent.length) {
    return '- none';
  }

  return recent.map(session => `- [${session.intent}] ${session.summary}`).join('\n');
}

function formatDecisions(longTerm: Awaited<ReturnType<typeof loadLongTermMemory>>): string {
  const decisions = longTerm.decisions?.slice(-3) ?? [];
  if (!decisions.length) {
    return '- none recorded';
  }

  return decisions.map(decision => `- ${decision.decision}`).join('\n');
}

function formatLessons(longTerm: Awaited<ReturnType<typeof loadLongTermMemory>>): string {
  const lessons = longTerm.lessons?.slice(-4) ?? [];
  if (!lessons.length) {
    return '- none';
  }

  return lessons.map(lesson => `- ${lesson.lesson}`).join('\n');
}

export async function buildTodayContext(now = new Date()): Promise<TodayContext> {
  const brain = await loadBrain();
  const working = await loadWorkingMemory();
  const longTerm = await loadLongTermMemory();

  const identitySlice = buildIdentitySlice(brain);
  const projectsSlice = buildProjectsSlice(brain, ['projects', 'reputation', 'creative']);
  const patternsSlice = buildPatternsSlice(brain);

  const promptBlock = [
    loadGiuseppeIdentityPrompt(),
    '',
    buildAppContextBlock(),
    '',
    `Manifesto: ${brain.manifesto}`,
    `Constitution — why: ${brain.constitution.why}`,
    `Constitution — how: ${brain.constitution.how.join(' | ')}`,
    '',
    `## ${identitySlice.label}`,
    identitySlice.content,
    '',
    `## ${projectsSlice.label}`,
    projectsSlice.content,
    '',
    `## ${patternsSlice.label}`,
    patternsSlice.content,
    '',
    'RECENT SESSIONS',
    formatRecentSessions(working.sessions),
    '',
    'RECENT DECISIONS',
    formatDecisions(longTerm),
    '',
    'RECENT LESSONS',
    formatLessons(longTerm)
  ].join('\n');

  return {
    dateKey: todayDateKey(now),
    generatedAt: now.toISOString(),
    promptBlock
  };
}
