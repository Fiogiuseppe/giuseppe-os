import type { AppLocale } from '../../lib/i18n/locale';
import { pickLocale } from '../../lib/i18n/locale';

export function weeklyFocusDefault(locale: AppLocale): string {
  return pickLocale(locale, 'Un passo verso libertà 2036.', 'One step toward freedom 2036.');
}

export function creativeChallengeVisceral(locale: AppLocale): string {
  return pickLocale(
    locale,
    'Scrivi un poem viscerale in meno di 40 righe — finito, non perfetto.',
    'Write a visceral poem in under 40 lines — finished, not perfect.'
  );
}

export function creativeChallengeUrees(locale: AppLocale): string {
  return pickLocale(
    locale,
    'Disegna un UREES che potresti spiegare in una frase a un estraneo.',
    'Design one UREES piece you could explain in a single sentence to a stranger.'
  );
}

export function creativeChallengeDefault(locale: AppLocale): string {
  return pickLocale(
    locale,
    'Crea qualcosa di piccolo ma indimenticabile in 60 minuti.',
    'Create something small but unforgettable in 60 minutes.'
  );
}

export function articleFallback(locale: AppLocale): string {
  return pickLocale(
    locale,
    'Un saggio che rafforza pensiero a lungo termine.',
    'An essay that strengthens long-term thinking.'
  );
}

export function questionOfTheDay(locale: AppLocale, value: string): string {
  return pickLocale(
    locale,
    `Questa mossa aumenta ${value.toLowerCase()} — o solo sollievo immediato?`,
    `Does this move increase ${value.toLowerCase()} — or only immediate relief?`
  );
}
