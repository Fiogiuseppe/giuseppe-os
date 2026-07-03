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

function missingNote(value: string | undefined, label: string): string {
  return value?.trim() ? value : `Informazione mancante: ${label}.`;
}

export function buildFallbackLetter(context: TodaysLetterContext): TodaysLetterSections {
  const leadProject = context.activeProjects[0];
  const topPriority = context.priorities[0];

  return {
    greeting: greetingForDayPart(context.dayPart),
    observation: topPriority
      ? `La priorità in cima è: ${topPriority}.`
      : 'Informazione mancante: nessuna priorità documentata.',
    whyItMatters: context.northStar
      ? `Conta perché serve la North Star: ${context.northStar}`
      : 'Informazione mancante: North Star non documentata.',
    recommendation: topPriority ?? 'Informazione mancante: nessuna azione concreta disponibile.',
    creativeSuggestion: leadProject
      ? `Dedica 30 minuti a ${leadProject.name}: ${leadProject.role}`
      : 'Informazione mancante: nessun progetto attivo documentato.',
    reflectionQuestion: context.mission
      ? `Questa scelta mi avvicina alla Mission 2036: ${context.mission}?`
      : missingNote(undefined, 'missione 2036')
  };
}
