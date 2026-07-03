import { runPotentialEngine } from '../../engine/potentialEngine';
import { runAwarenessEngine } from '../../engine/awarenessEngine';
import type { TodaysLetterContext, TodaysLetterSections } from './types';

function greetingForDayPart(dayPart: TodaysLetterContext['dayPart']): string {
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

export function buildFallbackLetter(context: TodaysLetterContext): TodaysLetterSections {
  const potential = runPotentialEngine();
  const awareness = runAwarenessEngine({ proactive: true });
  const today = potential.todaysOpportunity;
  const topPriority = context.priorities[0] ?? today.firstAction;
  const topPattern = context.patterns[0] ?? awareness.insight;

  return {
    greeting: greetingForDayPart(context.dayPart),
    observation: topPattern,
    whyItMatters: `${today.whyThisMatters} Oggi conta per la North Star: ${context.northStar.toLowerCase()}`,
    recommendation: topPriority,
    creativeSuggestion: potential.creativeChallenge,
    reflectionQuestion: awareness.reflectionQuestion
  };
}
