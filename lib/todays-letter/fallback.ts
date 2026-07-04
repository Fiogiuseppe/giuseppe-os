import type { DailyBriefingContext, DailyBriefingSections } from '../briefing/types';
import { pickLocale, type AppLocale } from '../i18n/locale';
import { limitWords } from './parse';
import { MAX_TODAY_ONE_BIG_MOVE_WORDS } from './prompt';
import type { TodayActionKind } from '../today-action/types';
import { inferTodayActionKind } from '../today-action/infer';

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

  const oneBigMove = limitWords(
    pickLocale(
      locale,
      leadProject
        ? `Pubblica oggi un post su LinkedIn su ${leadProject.name} — un insight concreto, non perfetto.`
        : topPriority
          ? `Blocca 45 minuti e fai solo questo: ${topPriority}.`
          : `Scrivi e pubblica un pensiero breve su ciò che stai costruendo verso il 2036.`,
      leadProject
        ? `Publish a LinkedIn post today about ${leadProject.name} — one concrete insight, not perfect.`
        : topPriority
          ? `Block 45 minutes and do only this: ${topPriority}.`
          : `Write and publish a short thought on what you are building toward 2036.`
    ),
    MAX_TODAY_ONE_BIG_MOVE_WORDS
  );
  const actionKind: TodayActionKind = inferTodayActionKind(oneBigMove);

  return {
    greeting: greetingForDayPart(context.dayPart, locale),
    oneBigMove,
    actionKind,
    actionTopic: topPriority ?? leadProject?.name ?? topRelevance?.headline,
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
