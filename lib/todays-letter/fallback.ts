import type { DailyBriefingContext, DailyBriefingSections } from '../briefing/types';
import { pickLocale, type AppLocale } from '../i18n/locale';

function greetingForDayPart(dayPart: DailyBriefingContext['dayPart'], locale: AppLocale): string {
  switch (dayPart) {
    case 'afternoon':
      return pickLocale(locale, 'Buon pomeriggio Giuseppe.', 'Good afternoon Giuseppe.');
    case 'evening':
      return pickLocale(locale, 'Buonasera Giuseppe.', 'Good evening Giuseppe.');
    case 'night':
      return pickLocale(locale, 'Buonanotte Giuseppe.', 'Good night Giuseppe.');
    default:
      return pickLocale(locale, 'Buongiorno Giuseppe.', 'Good morning Giuseppe.');
  }
}

function missingNote(label: string, locale: AppLocale): string {
  return pickLocale(locale, `Informazione mancante: ${label}.`, `Missing information: ${label}.`);
}

export function buildFallbackBriefing(context: DailyBriefingContext, locale: AppLocale = 'it'): DailyBriefingSections {
  const topRelevance = context.relevance.items[0];
  const secondRelevance = context.relevance.items[1];
  const leadProject = context.activeProjects[0];
  const topPriority = context.priorities[0];
  const dispersionPattern = context.patterns.find(pattern => /dispersione|troppi progetti/i.test(pattern));
  const reading = context.learningGoals[0];

  return {
    greeting: greetingForDayPart(context.dayPart, locale),
    oneBigMove:
      topPriority ??
      topRelevance?.headline ??
      missingNote(pickLocale(locale, 'mossa principale', 'main move'), locale),
    reality: topRelevance
      ? `${topRelevance.headline} — ${topRelevance.whyForGiuseppe}`
      : context.reality.externalFeedsActive === 0
        ? pickLocale(
            locale,
            'Nessun feed esterno attivo: la realtà filtrata viene solo dalla memoria documentata.',
            'No external feeds active: filtered reality comes only from documented memory.'
          )
        : missingNote(pickLocale(locale, 'segnale di realtà', 'reality signal'), locale),
    opportunity: topRelevance
      ? pickLocale(locale, `Esplora: ${topRelevance.headline}`, `Explore: ${topRelevance.headline}`)
      : leadProject
        ? pickLocale(
            locale,
            `Rafforza ${leadProject.name} con un solo passo concreto.`,
            `Strengthen ${leadProject.name} with one concrete step.`
          )
        : missingNote(pickLocale(locale, 'opportunità', 'opportunity'), locale),
    ignore: dispersionPattern
      ? pickLocale(locale, `Ignora oggi: ${dispersionPattern}`, `Ignore today: ${dispersionPattern}`)
      : secondRelevance
        ? pickLocale(
            locale,
            `Non inseguire: ${secondRelevance.headline}`,
            `Do not chase: ${secondRelevance.headline}`
          )
        : pickLocale(
            locale,
            'Ignora ciò che è interessante ma non cambia le tue probabilità.',
            'Ignore what is interesting but does not change your odds.'
          ),
    nourish: reading
      ? `Nourish: ${reading}`
      : leadProject
        ? pickLocale(
            locale,
            `Scrivi o costruisci qualcosa per ${leadProject.name}.`,
            `Write or build something for ${leadProject.name}.`
          )
        : missingNote('nourish', locale),
    reflection: context.mission
      ? pickLocale(
          locale,
          `Quale decisione di oggi aumenta la probabilità di: ${context.mission}?`,
          `Which decision today increases the probability of: ${context.mission}?`
        )
      : missingNote(pickLocale(locale, 'riflessione', 'reflection'), locale)
  };
}

/** @deprecated Use buildFallbackBriefing */
export const buildFallbackLetter = buildFallbackBriefing;
