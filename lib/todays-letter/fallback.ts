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

function missingNote(label: string): string {
  return `Informazione mancante: ${label}.`;
}

export function buildFallbackLetter(context: TodaysLetterContext): TodaysLetterSections {
  const topRelevance = context.relevance.items[0];
  const secondRelevance = context.relevance.items[1];
  const leadProject = context.activeProjects[0];
  const topPriority = context.priorities[0];
  const dispersionPattern = context.patterns.find(pattern => /dispersione|troppi progetti/i.test(pattern));

  return {
    greeting: greetingForDayPart(context.dayPart),
    observation: topRelevance
      ? topRelevance.headline
      : topPriority
        ? `La priorità in cima è: ${topPriority}.`
        : missingNote('osservazione rilevante'),
    whyItMatters: topRelevance
      ? topRelevance.whyForGiuseppe
      : context.northStar
        ? `Conta perché serve la North Star: ${context.northStar}`
        : missingNote('perché conta'),
    thingToIgnore: dispersionPattern
      ? `Ignora oggi: ${dispersionPattern}`
      : secondRelevance
        ? `Non inseguire: ${secondRelevance.headline}`
        : 'Ignora oggi ciò che è interessante ma non aumenta materialmente le tue probabilità.',
    thingToFocusOn: topPriority ?? topRelevance?.headline ?? missingNote('focus di oggi'),
    creativeSuggestion: leadProject
      ? `Dedica 30 minuti a ${leadProject.name}: ${leadProject.role}`
      : missingNote('suggerimento creativo'),
    opportunity: topRelevance
      ? `Opportunità: ${topRelevance.headline}`
      : leadProject
        ? `Rafforza ${leadProject.name} con un solo passo concreto.`
        : missingNote('opportunità'),
    reflectionQuestion: context.mission
      ? `Questa scelta aumenta la probabilità di diventare chi ho scelto di diventare: ${context.mission}?`
      : missingNote('domanda di riflessione')
  };
}
