import { loadBrain } from '../brain/memory/store';
import { pickLocale, type AppLocale } from '../i18n/locale';
import type { TodayContext, TodayPayload } from './types';

function firstActiveProject(brain: Awaited<ReturnType<typeof loadBrain>>): string {
  const active = Object.entries(brain.projects).find(
    ([, project]) => project.status === 'active' || project.status === 'slow-active'
  );
  return active?.[0] ?? 'Giuseppe OS';
}

export async function buildFallbackTodayPayload(
  context: TodayContext,
  locale: AppLocale = 'it'
): Promise<TodayPayload> {
  const brain = await loadBrain();
  const project = firstActiveProject(brain);
  const pattern = brain.patterns[0] ?? pickLocale(locale, 'troppi fronti aperti', 'too many open fronts');

  return {
    greeting: pickLocale(
      locale,
      'Buongiorno Giuseppe. Oggi conta una mossa sola.',
      'Good morning Giuseppe. Today one move matters.'
    ),
    mindful_reflection: pickLocale(
      locale,
      `Il tuo North Star resta: ${brain.north_star.toLowerCase()}.`,
      `Your North Star remains: ${brain.north_star.toLowerCase()}.`
    ),
    today_focus: pickLocale(
      locale,
      `Sposta ${project} di un passo verso la missione 2036.`,
      `Move ${project} one step toward the 2036 mission.`
    ),
    next_action: pickLocale(
      locale,
      `Blocca 45 minuti su ${project} e chiudi un deliverable visibile oggi.`,
      `Block 45 minutes on ${project} and finish one visible deliverable today.`
    ),
    risk_or_distraction: pickLocale(
      locale,
      `Ignora oggi ciò che non serve ${brain.mission_2036.toLowerCase()}.`,
      `Ignore today what does not serve ${brain.mission_2036.toLowerCase()}.`
    ),
    personal_insight: pickLocale(
      locale,
      `Pattern attivo: ${pattern}.`,
      `Active pattern: ${pattern}.`
    ),
    closing_line: pickLocale(
      locale,
      'Un passo reale batte dieci idee.',
      'One real step beats ten ideas.'
    )
  };
}
