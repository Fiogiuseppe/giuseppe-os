import type { AppLocale } from '../../lib/i18n/locale';
import type { DecisionCategory } from '../decisionEngine';

export const HIDDEN_NEED_DEFAULT: Record<AppLocale, string> = {
  it: 'Chiarezza su cosa vuoi davvero — e perché proprio adesso.',
  en: 'Clarity on what you truly want — and why right now.'
};

export const BIAS_DEFAULT: Record<AppLocale, string> = {
  it: 'Nessun bias forte rilevato — resta vigile su impulso e timing.',
  en: 'No strong bias detected — stay alert to impulse and timing.'
};

export const BETTER_VERSION: Record<AppLocale, Record<DecisionCategory, (decision: string) => string>> = {
  it: {
    real_estate: d =>
      `Invece di "${d}", compra casa solo quando anticipo, runway e investimenti automatici restano intatti — e la casa aumenta libertà, non solo toglie l'affitto.`,
    emotional_purchase: d =>
      `Invece di "${d}", aspetta 90 giorni, fissa un budget massimo reversibile e verifica che non tocchi fondo emergenza né piano ETF.`,
    career: d =>
      `Invece di "${d}", scegli la mossa che aumenta ownership e reputazione dentro l'ecosistema LEGO/Giuseppe — senza lasciare stabilità senza seconda fonte.`,
    reputation: d =>
      `Invece di "${d}", pubblica una versione imperfetta ma vera che mostra come pensi — rivolta a professionisti che vuoi rispettino il tuo lavoro.`,
    creative_project: d =>
      `Invece di "${d}", realizza una micro-versione di altissima qualità che resta sacra — non industrializzare ciò che deve conservare identità.`,
    finance: d =>
      `Invece di "${d}", prima fondo emergenza poi ETF automatico — misura mesi di libertà, non solo rendimento.`,
    life_decision: d =>
      `Invece di "${d}", trova la versione più piccola e reversibile che aumenta libertà, verità o amore — e aspetta se nasce da ansia.`
  },
  en: {
    real_estate: d =>
      `Instead of "${d}", buy a home only when down payment, runway, and automatic investments stay intact — and the home increases freedom, not just removes rent.`,
    emotional_purchase: d =>
      `Instead of "${d}", wait 90 days, set a reversible maximum budget, and verify it does not touch emergency fund or ETF plan.`,
    career: d =>
      `Instead of "${d}", choose the move that increases ownership and reputation inside the LEGO/Giuseppe ecosystem — without leaving stability without a second income source.`,
    reputation: d =>
      `Instead of "${d}", publish an imperfect but true version that shows how you think — aimed at professionals you want to respect your work.`,
    creative_project: d =>
      `Instead of "${d}", ship one excellent micro-version that stays sacred — do not industrialize what must keep its identity.`,
    finance: d =>
      `Instead of "${d}", emergency fund first, then automatic ETF — measure months of freedom, not just return.`,
    life_decision: d =>
      `Instead of "${d}", find the smallest reversible version that increases freedom, truth, or love — and wait if it comes from anxiety.`
  }
};

export const NEXT_ACTION: Record<AppLocale, Record<DecisionCategory, string>> = {
  it: {
    real_estate:
      'Calcola anticipo minimo, costo mensile totale e mesi di runway persi — poi confronta con 24 mesi di affitto consapevole.',
    emotional_purchase:
      'Scrivi prezzo massimo, data di revisione a 90 giorni e condizione di uscita prima di aprire qualsiasi trattativa.',
    career: 'Elenca cosa questa mossa aggiunge a LEGO, Brand Giuseppe e reddito — se non rafforza almeno due, congela.',
    reputation:
      'Bozza in 30 minuti un post che spiega un problema reale che hai risolto — pubblica entro questa settimana.',
    creative_project:
      "Definisci la micro-versione completabile in 2 settimane con qualità eccellente — nient'altro finché non è finita.",
    finance:
      'Imposta o aumenta oggi un trasferimento automatico verso ETF o fondo emergenza — importo fisso, niente trading.',
    life_decision:
      'Scrivi su carta: questa scelta aumenta libertà, verità o amore? Se non aumenta almeno uno, aspetta 7 giorni.'
  },
  en: {
    real_estate:
      'Calculate minimum down payment, total monthly cost, and months of runway lost — then compare with 24 months of intentional renting.',
    emotional_purchase:
      'Write maximum price, 90-day review date, and exit condition before opening any negotiation.',
    career:
      'List what this move adds to LEGO, Brand Giuseppe, and income — if it does not strengthen at least two, freeze it.',
    reputation:
      'Draft in 30 minutes a post explaining a real problem you solved — publish within this week.',
    creative_project:
      'Define the micro-version completable in 2 weeks with excellent quality — nothing else until it is finished.',
    finance:
      'Set or increase an automatic transfer to ETF or emergency fund today — fixed amount, no trading.',
    life_decision:
      'Write on paper: does this choice increase freedom, truth, or love? If not at least one, wait 7 days.'
  }
};

export const DISPERSION_ACTION: Record<AppLocale, string> = {
  it: 'Congela ogni nuovo fronte per 30 giorni e torna al progetto attivo con priorità più alta.',
  en: 'Freeze every new front for 30 days and return to the highest-priority active project.'
};

export const FEAR_ACTION: Record<AppLocale, (decision: string) => string> = {
  it: d =>
    `Prima di decidere su "${d}", descrivi la peggior conseguenza realistica e il piano se accadesse — poi rivaluta.`,
  en: d =>
    `Before deciding on "${d}", describe the worst realistic consequence and the plan if it happens — then reassess.`
};

export const URGENCY_SUFFIX: Record<AppLocale, (reason: string) => string> = {
  it: reason =>
    ` Non agire per urgenza: il motivo dichiarato ("${reason || 'non chiarito'}") merita 48 ore di distanza emotiva.`,
  en: reason =>
    ` Do not act from urgency: the stated reason ("${reason || 'not clarified'}") deserves 48 hours of emotional distance.`
};
