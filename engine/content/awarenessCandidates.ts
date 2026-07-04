import type { AppLocale } from '../../lib/i18n/locale';
import type { LongTermMemory } from '../../lib/brain/types';
import type { DecisionRecord } from '../awarenessEngine';

export type InsightCandidate = {
  id: string;
  signalType: 'pattern' | 'contradiction' | 'opportunity' | 'risk';
  insight: string;
  whyItMatters: string;
  evidence: string[];
  riskIfIgnored: string;
  reflectionQuestion: string;
  recommendedAction: string;
  weight: number;
  confidenceSignals: number;
};

type CandidateSeed = Omit<InsightCandidate, 'evidence' | 'weight'> & {
  buildWeight: (ctx: CandidateContext) => number;
  buildEvidence: (ctx: CandidateContext) => string[];
};

type CandidateContext = {
  history: DecisionRecord[];
  longTerm: LongTermMemory;
  activeCount: number;
  slowActive: string[];
  activeNames: string[];
  signals: ReturnType<typeof decisionSignals>;
  memoryEvidence: string[];
};

function decisionSignals(history: DecisionRecord[]) {
  const signals = { dispersion: 0, finance: 0, creative: 0, reputation: 0 };

  for (const record of history) {
    const text = `${record.decision} ${record.reason} ${record.category ?? ''}`.toLowerCase();

    if (/casa|invest|etf|finanz|soldi|affitt|wrangler|house|money|rent/.test(text)) signals.finance += 2;
    if (/pubblic|post|linkedin|medium|reputat/.test(text)) signals.reputation += 2;
    if (/urees|poem|creativ|prototip|disegn|design/.test(text)) signals.creative += 2;
    if (/nuov|idea|progett|freelance|aprire|new|project|open/.test(text)) signals.dispersion += 2;
  }

  return signals;
}

function recurringWeight(insightId: string, longTerm: LongTermMemory): number {
  const repeats = (longTerm.insight_history ?? []).filter(entry => entry.insightId === insightId).length;
  return repeats * 4;
}

const SEEDS: Record<AppLocale, CandidateSeed[]> = {
  it: [
    {
      id: 'dispersion',
      signalType: 'pattern',
      insight: 'Stai portando troppi fronti attivi contemporaneamente.',
      whyItMatters:
        'La North Star chiede libertà per creare ciò che conta — ma i progetti attivi competono per la stessa attenzione. La missione 2036 non si raggiunge con più idee, ma con più concentrazione.',
      riskIfIgnored:
        'Ogni nuovo fronte rallenta LEGO, Brand Giuseppe e la pubblicazione — senza avvicinarti a libertà 2036.',
      reflectionQuestion:
        'Se potessi tenere solo due fronti per i prossimi 90 giorni, quali proteggerebbero davvero chi vuoi diventare?',
      recommendedAction:
        'Scrivi oggi quali fronti congeli per 30 giorni e torna alla priorità #1: pubblicare un pensiero vero.',
      buildWeight: ctx =>
        ctx.activeCount * 3 +
        (ctx.signals.dispersion > 0 ? 4 : 0) +
        ctx.signals.dispersion +
        recurringWeight('dispersion', ctx.longTerm),
      buildEvidence: ctx => [
        `Fronti attivi: ${ctx.activeNames.join(', ')}`,
        ...ctx.memoryEvidence
      ],
      confidenceSignals: 2
    },
    {
      id: 'liquidity-discipline',
      signalType: 'contradiction',
      insight: 'Hai liquidità forte, ma la disciplina automatica non è ancora il centro del sistema.',
      whyItMatters:
        'Ogni mese senza automazione è un mese in cui comprare libertà dipende dalla forza di volontà — non dal sistema.',
      riskIfIgnored:
        'La liquidità diventa status o comfort immediato invece di mesi di libertà verso casa a Copenaghen.',
      reflectionQuestion:
        'Quanti mesi di libertà stai comprando questo mese — e quanti ne stai solo tenendo in conto?',
      recommendedAction:
        'Imposta oggi un trasferimento mensile automatico verso ETF o fondo emergenza, prima di qualsiasi altra decisione finanziaria.',
      buildWeight: ctx => ctx.signals.finance + recurringWeight('liquidity-discipline', ctx.longTerm) + 5,
      buildEvidence: ctx => [...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'sacred-creative-stall',
      signalType: 'risk',
      insight: "Il lavoro sacro creativo sta aspettando mentre i fronti attivi prendono tutta l'energia.",
      whyItMatters:
        'La North Star parla di creare ciò che conta. I progetti slow-active sono capitale creativo sacro — ma restano in pausa mentre la dispersione è il rischio principale.',
      riskIfIgnored:
        'Visceral Poems e UREES restano intenzioni eccellenti senza diventare prove pubbliche della persona che vuoi essere.',
      reflectionQuestion:
        'Quale singola opera creativa, se finita questa settimana, ti farebbe sentire più vicino a chi hai scelto di diventare?',
      recommendedAction:
        'Blocca 90 minuti senza distrazioni per una sola micro-versione finita di Visceral Poems o UREES.',
      buildWeight: ctx =>
        ctx.slowActive.length * 4 + ctx.signals.creative + recurringWeight('sacred-creative-stall', ctx.longTerm),
      buildEvidence: ctx => [`Progetti slow-active: ${ctx.slowActive.join(', ')}`, ...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'reputation-gap',
      signalType: 'opportunity',
      insight: 'Vuoi visibilità, ma la strategia giusta è reputazione stimata — e la pubblicazione è in ritardo.',
      whyItMatters:
        'La missione 2036 richiede opzionalità e riconoscimento tra professionisti, non fama generica.',
      riskIfIgnored:
        'Il talento resta privato mentre altri costruiscono la reputazione che tu stai rimandando.',
      reflectionQuestion:
        'Quale pensiero vero, se pubblicato questa settimana, mostrerebbe come pensi — non solo cosa fai?',
      recommendedAction:
        "Scrivi in 30 minuti una bozza su un problema reale risolto questa settimana e pubblicala senza perfezionarla all'infinito.",
      buildWeight: ctx => ctx.signals.reputation + recurringWeight('reputation-gap', ctx.longTerm) + 5,
      buildEvidence: ctx => [...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'lego-accelerator',
      signalType: 'opportunity',
      insight: 'LEGO è il motore principale — ma ownership e visibilità non stanno ancora lavorando al massimo per libertà 2036.',
      whyItMatters:
        'LEGO non è la destinazione: è l\'acceleratore. Reddito e reputazione devono convertire in opzionalità futura.',
      riskIfIgnored:
        'LEGO resta un buon lavoro invece di diventare il ponte misurabile verso la libertà di scegliere.',
      reflectionQuestion:
        'Quale conversazione di ownership, se fatta questa settimana, aumenterebbe il tuo impatto e la tua opzionalità?',
      recommendedAction:
        'Prepara tre esempi concreti di impatto e chiedi un incontro di 20 minuti con un leader LEGO chiave.',
      buildWeight: ctx => recurringWeight('lego-accelerator', ctx.longTerm) + 7,
      buildEvidence: ctx => [...ctx.memoryEvidence],
      confidenceSignals: 2
    }
  ],
  en: [
    {
      id: 'dispersion',
      signalType: 'pattern',
      insight: 'You are carrying too many active fronts at once.',
      whyItMatters:
        'The North Star asks for freedom to create what matters — but active projects compete for the same attention. The 2036 mission is not reached with more ideas, but with more concentration.',
      riskIfIgnored:
        'Every new front slows LEGO, Brand Giuseppe, and publishing — without moving you closer to 2036 freedom.',
      reflectionQuestion:
        'If you could keep only two fronts for the next 90 days, which would protect who you want to become?',
      recommendedAction:
        'Write today which fronts you freeze for 30 days and return to priority #1: publish one true thought.',
      buildWeight: ctx =>
        ctx.activeCount * 3 +
        (ctx.signals.dispersion > 0 ? 4 : 0) +
        ctx.signals.dispersion +
        recurringWeight('dispersion', ctx.longTerm),
      buildEvidence: ctx => [`Active fronts: ${ctx.activeNames.join(', ')}`, ...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'liquidity-discipline',
      signalType: 'contradiction',
      insight: 'Liquidity is strong, but automatic discipline is not yet the centre of the system.',
      whyItMatters:
        'Every month without automation is a month where buying freedom depends on willpower — not on the system.',
      riskIfIgnored:
        'Liquidity becomes status or immediate comfort instead of months of freedom toward Copenhagen.',
      reflectionQuestion:
        'How many months of freedom are you buying this month — and how many are you only holding in an account?',
      recommendedAction:
        'Set up an automatic monthly transfer to ETF or emergency fund today, before any other financial decision.',
      buildWeight: ctx => ctx.signals.finance + recurringWeight('liquidity-discipline', ctx.longTerm) + 5,
      buildEvidence: ctx => [...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'sacred-creative-stall',
      signalType: 'risk',
      insight: 'Sacred creative work is waiting while active fronts take all the energy.',
      whyItMatters:
        'The North Star is about creating what matters. Slow-active projects are sacred creative capital — but they stay paused while dispersion is the main risk.',
      riskIfIgnored:
        'Visceral Poems and UREES remain excellent intentions without becoming public proof of who you want to be.',
      reflectionQuestion:
        'Which single creative work, if finished this week, would make you feel closer to who you chose to become?',
      recommendedAction:
        'Block 90 distraction-free minutes for one finished micro-version of Visceral Poems or UREES.',
      buildWeight: ctx =>
        ctx.slowActive.length * 4 + ctx.signals.creative + recurringWeight('sacred-creative-stall', ctx.longTerm),
      buildEvidence: ctx => [`Slow-active projects: ${ctx.slowActive.join(', ')}`, ...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'reputation-gap',
      signalType: 'opportunity',
      insight: 'You want visibility, but the right strategy is earned reputation — and publishing is late.',
      whyItMatters:
        'The 2036 mission needs optionality and recognition among professionals, not generic fame.',
      riskIfIgnored:
        'Talent stays private while others build the reputation you keep postponing.',
      reflectionQuestion:
        'Which true thought, if published this week, would show how you think — not just what you do?',
      recommendedAction:
        'Draft in 30 minutes on a real problem you solved this week and publish without endless polishing.',
      buildWeight: ctx => ctx.signals.reputation + recurringWeight('reputation-gap', ctx.longTerm) + 5,
      buildEvidence: ctx => [...ctx.memoryEvidence],
      confidenceSignals: 2
    },
    {
      id: 'lego-accelerator',
      signalType: 'opportunity',
      insight: 'LEGO is the main engine — but ownership and visibility are not yet working at full power for 2036 freedom.',
      whyItMatters:
        'LEGO is not the destination: it is the accelerator. Income and reputation must convert into future optionality.',
      riskIfIgnored:
        'LEGO stays a good job instead of becoming the measurable bridge toward the freedom to choose.',
      reflectionQuestion:
        'Which ownership conversation, if held this week, would increase your impact and optionality?',
      recommendedAction:
        'Prepare three concrete impact examples and request a 20-minute meeting with a key LEGO leader.',
      buildWeight: ctx => recurringWeight('lego-accelerator', ctx.longTerm) + 7,
      buildEvidence: ctx => [...ctx.memoryEvidence],
      confidenceSignals: 2
    }
  ]
};

export function buildAwarenessCandidates(
  locale: AppLocale,
  history: DecisionRecord[],
  longTerm: LongTermMemory,
  activeCount: number,
  slowActive: string[],
  activeNames: string[]
): InsightCandidate[] {
  const memoryEvidence: string[] = [];
  if (history.length > 0) {
    memoryEvidence.push(
      locale === 'en'
        ? `${history.length} decision${history.length === 1 ? '' : 's'} recorded in memory`
        : `${history.length} decision${history.length === 1 ? '' : 'i'} registrat${history.length === 1 ? 'a' : 'e'} in memoria`
    );
  }
  if ((longTerm.insight_history ?? []).length > 0) {
    const count = longTerm.insight_history!.length;
    memoryEvidence.push(
      locale === 'en'
        ? `${count} prior insight observation${count === 1 ? '' : 's'}`
        : `${count} osservazioni insight precedenti`
    );
  }

  const ctx: CandidateContext = {
    history,
    longTerm,
    activeCount,
    slowActive,
    activeNames,
    signals: decisionSignals(history),
    memoryEvidence
  };

  return SEEDS[locale].map(seed => ({
    id: seed.id,
    signalType: seed.signalType,
    insight: seed.insight,
    whyItMatters: seed.whyItMatters,
    evidence: seed.buildEvidence(ctx),
    riskIfIgnored: seed.riskIfIgnored,
    reflectionQuestion: seed.reflectionQuestion,
    recommendedAction: seed.recommendedAction,
    weight: seed.buildWeight(ctx),
    confidenceSignals: seed.confidenceSignals + Math.min(history.length, 4)
  }));
}
