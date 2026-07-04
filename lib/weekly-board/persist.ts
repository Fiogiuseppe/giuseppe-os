import { loadLongTermMemory, saveLongTermMemory } from '../brain/memory/store';
import type { WeeklyBoardResponse } from './types';

export async function persistWeeklyBoardToMemory(
  board: WeeklyBoardResponse,
  weekKey: string
): Promise<void> {
  if (board.pipeline.thinEvidence) {
    return;
  }

  const source = `weekly-board:${weekKey}`;
  const longTerm = await loadLongTermMemory();

  if (longTerm.lessons.some(row => row.source === source)) {
    return;
  }

  const lessonParts = [
    `Priorities: ${board.priorities.join(' | ')}`,
    `Do not: ${board.doNotDo.join(' | ')}`,
    `Challenge: ${board.challenge}`,
    `Trajectory: ${board.trajectoryCheck}`
  ];

  const lesson = {
    id: `lesson_weekly_${weekKey.replace(/[^a-zA-Z0-9]/g, '_')}`,
    lesson: lessonParts.join(' — '),
    source,
    timestamp: board.generatedAt
  };

  const patternSeed = `weekly-board ${weekKey}: ${board.challenge}`;
  const nextPatterns = longTerm.patterns_detected.includes(patternSeed)
    ? longTerm.patterns_detected
    : [...longTerm.patterns_detected, patternSeed].slice(-20);

  await saveLongTermMemory({
    ...longTerm,
    lessons: [...longTerm.lessons, lesson].slice(-50),
    patterns_detected: nextPatterns
  });
}
