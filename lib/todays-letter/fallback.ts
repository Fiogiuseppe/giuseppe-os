import type { DailyBriefingContext, DailyBriefingSections } from '../briefing/types';

function greetingForDayPart(dayPart: DailyBriefingContext['dayPart']): string {
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

export function buildFallbackBriefing(context: DailyBriefingContext): DailyBriefingSections {
  const topRelevance = context.relevance.items[0];
  const secondRelevance = context.relevance.items[1];
  const leadProject = context.activeProjects[0];
  const topPriority = context.priorities[0];
  const dispersionPattern = context.patterns.find(pattern => /dispersione|troppi progetti/i.test(pattern));
  const reading = context.learningGoals[0];

  return {
    greeting: greetingForDayPart(context.dayPart),
    oneBigMove: topPriority ?? topRelevance?.headline ?? missingNote('mossa principale'),
    reality: topRelevance
      ? `${topRelevance.headline} — ${topRelevance.whyForGiuseppe}`
      : context.reality.externalFeedsActive === 0
        ? 'Nessun feed esterno attivo: la realtà filtrata viene solo dalla memoria documentata.'
        : missingNote('segnale di realtà'),
    opportunity: topRelevance
      ? `Esplora: ${topRelevance.headline}`
      : leadProject
        ? `Rafforza ${leadProject.name} con un solo passo concreto.`
        : missingNote('opportunità'),
    ignore: dispersionPattern
      ? `Ignora oggi: ${dispersionPattern}`
      : secondRelevance
        ? `Non inseguire: ${secondRelevance.headline}`
        : 'Ignora ciò che è interessante ma non cambia le tue probabilità.',
    nourish: reading
      ? `Nourish: ${reading}`
      : leadProject
        ? `Scrivi o costruisci qualcosa per ${leadProject.name}.`
        : missingNote('nourish'),
    reflection: context.mission
      ? `Quale decisione di oggi aumenta la probabilità di: ${context.mission}?`
      : missingNote('riflessione')
  };
}

/** @deprecated Use buildFallbackBriefing */
export const buildFallbackLetter = buildFallbackBriefing;
