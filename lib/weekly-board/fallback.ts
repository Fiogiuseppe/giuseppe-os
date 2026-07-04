import { BRIEFING_SILENCE_MESSAGE } from '../philosophy/core';
import { pickLocale, type AppLocale } from '../i18n/locale';
import type { WeeklyBoardContext, WeeklyBoardSections } from './types';

export function buildFallbackWeeklyBoard(
  context: WeeklyBoardContext,
  locale: AppLocale = context.locale
): WeeklyBoardSections {
  if (context.thinEvidence) {
    const silence = BRIEFING_SILENCE_MESSAGE;
    return {
      priorities: [silence],
      doNotDo: [
        pickLocale(
          locale,
          'Non inventare priorità senza evidenza settimanale.',
          'Do not invent priorities without weekly evidence.'
        )
      ],
      challenge: pickLocale(
        locale,
        'Questa settimana: registra almeno una decisione e rivedi il suo esito prima del prossimo board.',
        'This week: record at least one decision and review its outcome before the next board.'
      ),
      trajectoryCheck: pickLocale(
        locale,
        'Dati insufficienti per un controllo traiettoria onesto. Il board aspetta evidenza reale — decisioni revisionate, pattern osservati, streak documentati.',
        'Not enough data for an honest trajectory check. The board waits for real evidence — reviewed decisions, observed patterns, documented streaks.'
      )
    };
  }

  const topPriority = context.priorities[0];
  const topPattern = context.patterns[0];
  const secondPattern = context.patterns[1];

  return {
    priorities: [
      topPriority ??
        pickLocale(locale, 'Un passo verso la North Star questa settimana.', 'One step toward the North Star this week.'),
      pickLocale(
        locale,
        `Proteggi concentrazione su: ${context.mission}`,
        `Protect focus on: ${context.mission}`
      ),
      context.evidence.outcomes > 0
        ? pickLocale(
            locale,
            'Ripeti ciò che ha funzionato nelle decisioni revisionate.',
            'Repeat what worked in reviewed decisions.'
          )
        : pickLocale(locale, 'Chiudi una decisione aperta con evidenza.', 'Close one open decision with evidence.')
    ].slice(0, 3),
    doNotDo: [
      topPattern
        ? pickLocale(locale, `Evita: ${topPattern}`, `Avoid: ${topPattern}`)
        : pickLocale(locale, 'Non aprire nuovi fronti senza chiudere uno.', 'Do not open new fronts without closing one.'),
      pickLocale(locale, 'Non comprare ansia con attività.', 'Do not buy anxiety with activity.'),
      secondPattern
        ? pickLocale(locale, `Non ripetere: ${secondPattern}`, `Do not repeat: ${secondPattern}`)
        : pickLocale(locale, 'Non rifinire all’infinito.', 'Do not refine forever.')
    ].slice(0, 3),
    challenge: pickLocale(
      locale,
      '7 giorni: 1 decisione revisionata, 1 mossa su priorità, 0 nuove idee.',
      '7 days: 1 reviewed decision, 1 move on priority, 0 new ideas.'
    ),
    trajectoryCheck: pickLocale(
      locale,
      `Questa settimana ${context.evidence.outcomes} esiti revisionati, ${context.evidence.decisions} decisioni e ${context.evidence.patterns} pattern in memoria. La domanda: ogni mossa avvicina a "${context.northStar}"?`,
      `This week: ${context.evidence.outcomes} reviewed outcomes, ${context.evidence.decisions} decisions, and ${context.evidence.patterns} patterns in memory. The question: does each move move you toward "${context.northStar}"?`
    )
  };
}
