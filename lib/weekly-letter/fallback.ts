import { BRIEFING_SILENCE_MESSAGE } from '../philosophy/core';
import { pickLocale } from '../i18n/locale';
import type { WeeklyLetterContext, WeeklyLetterContent } from './types';

export function buildFallbackWeeklyLetter(context: WeeklyLetterContext): WeeklyLetterContent {
  if (context.thinEvidence) {
    return {
      openingSentence: 'This week did not leave much trace in the system — and that is worth naming honestly.',
      noticed: [
        'I do not have enough evidence yet to judge this pattern.',
        pickLocale(
          context.locale,
          'Le decisioni e gli esiti revisionati di questa settimana sono pochi o assenti.',
          'Reviewed decisions and outcomes for this week are sparse or missing.'
        ),
        pickLocale(
          context.locale,
          'Senza evidenza, qualsiasi consiglio sarebbe rumore.',
          'Without evidence, any advice would be noise.'
        )
      ].slice(0, 3),
      movedForward: [
        context.northStar
          ? pickLocale(
              context.locale,
              `La North Star resta chiara: ${context.northStar}`,
              `The North Star remains clear: ${context.northStar}`
            )
          : pickLocale(context.locale, 'La direzione generale resta invariata.', 'The general direction remains unchanged.')
      ],
      slowedDown: [
        pickLocale(
          context.locale,
          'Mancanza di decisioni documentate rallenta l\'apprendimento del sistema.',
          'Missing documented decisions slows the system\'s learning.'
        ),
        pickLocale(
          context.locale,
          'Nessun esito revisionato questa settimana.',
          'No reviewed outcomes this week.'
        )
      ],
      opportunities: [
        context.activeProjects[0]
          ? pickLocale(
              context.locale,
              `Un passo su ${context.activeProjects[0].name} — se ancora allineato alla missione.`,
              `One step on ${context.activeProjects[0].name} — if still aligned with the mission.`
            )
          : pickLocale(context.locale, 'Registrare una decisione reale questa settimana.', 'Record one real decision this week.')
      ],
      managersAdvice: pickLocale(
        context.locale,
        'Non forzare produttività. Documenta una decisione, rivedi un esito, proteggi concentrazione.',
        'Do not force productivity. Document one decision, review one outcome, protect focus.'
      ),
      nextWeekActions: [
        pickLocale(context.locale, 'Registra almeno una decisione con motivo.', 'Record at least one decision with reasoning.'),
        pickLocale(context.locale, 'Rivedi un esito di una decisione passata.', 'Review the outcome of one past decision.'),
        pickLocale(
          context.locale,
          'Proteggi un blocco di lavoro profondo su una priorità.',
          'Protect one deep-work block on a priority.'
        )
      ]
    };
  }

  const topPriority = context.priorities[0];
  const topPattern = context.patterns[0];

  return {
    openingSentence: topPriority
      ? `This week was about holding the line on what matters: ${topPriority}.`
      : BRIEFING_SILENCE_MESSAGE,
    noticed: [
      `${context.evidence.decisions} decision(s) and ${context.evidence.outcomes} reviewed outcome(s) this week.`,
      topPattern ? `A recurring pattern in memory: ${topPattern}` : 'No strong new patterns surfaced.',
      context.connectedSourceLabels.length
        ? `${context.connectedSourceLabels.length} connected source(s) available for context.`
        : 'No connected sources feeding external evidence yet.'
    ].slice(0, 3),
    movedForward: [
      context.evidence.outcomes > 0
        ? 'You closed the loop on at least one decision with a reviewed outcome.'
        : topPriority ?? 'You kept direction on your stated priorities.',
      context.activeProjects[0]
        ? `${context.activeProjects[0].name} remains active in your portfolio.`
        : 'Creative focus stayed on documented projects.',
      context.evidence.insights > 0 ? `${context.evidence.insights} insight(s) were captured.` : 'Memory patterns were maintained.'
    ].slice(0, 3),
    slowedDown: [
      context.evidence.decisions === 0 ? 'No new decisions were logged this week.' : 'Decision velocity was lower than ideal.',
      context.evidence.workingSessions < 2 ? 'Light activity in working memory — fewer documented sessions.' : 'Some sessions lacked clear decision follow-through.',
      topPattern ? `Watch for: ${topPattern}` : 'Open loops without reviewed outcomes.'
    ].slice(0, 3),
    opportunities: [
      context.activeProjects[1]
        ? `Advance ${context.activeProjects[1].name} with one concrete move.`
        : context.activeProjects[0]
          ? `Deepen ${context.activeProjects[0].name} instead of opening new fronts.`
          : 'Clarify one active project before adding more.',
      context.evidence.outcomes === 0 ? 'Review one pending decision outcome.' : 'Repeat what worked in reviewed outcomes.',
      context.guardianNote ? 'Address the highest Guardian finding before shipping more surface area.' : 'Protect focus over new inputs.'
    ].slice(0, 3),
    managersAdvice: `Protect trajectory toward "${context.northStar}". One strong move beats five scattered ones.`,
    nextWeekActions: [
      topPriority ? `One deliberate move on: ${topPriority}` : 'Name and record one priority decision.',
      'Review one open decision outcome.',
      'Decline one distraction that does not serve the mission.'
    ]
  };
}
