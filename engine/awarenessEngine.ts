import brain from '../memory/giuseppe_brain.json';
import { liquidityPhrase, incomeLabel } from '../lib/publicFinance';

export type DecisionRecord = {
  decision: string;
  reason: string;
  category?: string;
};

export type AwarenessInsight = {
  headline: string;
  insight: string;
  whyItMatters: string;
  evidence: string[];
  riskIfIgnored: string;
  reflectionQuestion: string;
  recommendedAction: string;
  confidenceScore: number;
  signalType: 'pattern' | 'contradiction' | 'opportunity' | 'risk';
  proactive: boolean;
};

type BrainProject = {
  role: string;
  status: string;
};

type GiuseppeBrain = {
  north_star: string;
  mission_2036: string;
  manifesto: string;
  values: string[];
  rules: string[];
  projects: Record<string, BrainProject>;
  finance: {
    cash_dkk: number;
    liquidity_tier?: string;
    monthly_income_notes: string;
    main_goals: string[];
  };
  patterns: string[];
  skills: string[];
  priorities: string[];
  creative_goals: string[];
  career_goals: string[];
  reading_queue: string[];
  contacts: string[];
};

const memory = brain as GiuseppeBrain;

type InsightCandidate = {
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

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function countProjectsByStatus(status: string): number {
  return Object.values(memory.projects).filter(project => project.status === status).length;
}

function activeProjectNames(): string[] {
  return Object.entries(memory.projects)
    .filter(([, project]) => project.status === 'active')
    .map(([name]) => name);
}

function slowActiveProjectNames(): string[] {
  return Object.entries(memory.projects)
    .filter(([, project]) => project.status === 'slow-active')
    .map(([name]) => name);
}

function decisionSignals(history: DecisionRecord[]): {
  dispersion: number;
  finance: number;
  creative: number;
  reputation: number;
} {
  const signals = { dispersion: 0, finance: 0, creative: 0, reputation: 0 };

  for (const record of history) {
    const text = `${record.decision} ${record.reason} ${record.category ?? ''}`.toLowerCase();

    if (/casa|invest|etf|finanz|soldi|affitt|wrangler/.test(text)) signals.finance += 2;
    if (/pubblic|post|linkedin|medium|reputaz/.test(text)) signals.reputation += 2;
    if (/urees|poem|creativ|prototip|disegn/.test(text)) signals.creative += 2;
    if (/nuov|idea|progett|freelance|aprire/.test(text)) signals.dispersion += 2;
  }

  return signals;
}

function buildCandidates(history: DecisionRecord[]): InsightCandidate[] {
  const activeCount = countProjectsByStatus('active');
  const slowActive = slowActiveProjectNames();
  const activeNames = activeProjectNames();
  const signals = decisionSignals(history);

  return [
    {
      id: 'dispersion',
      signalType: 'pattern',
      insight: 'Stai portando troppi fronti attivi contemporaneamente.',
      whyItMatters:
        `La North Star chiede libertà per creare ciò che conta — ma ${activeCount} progetti attivi competono per la stessa attenzione. La missione 2036 non si raggiunge con più idee, ma con più concentrazione.`,
      evidence: [
        `Pattern: "${memory.patterns[1]}"`,
        `Priorità attuale: "${memory.priorities[2]}"`,
        `Fronti attivi: ${activeNames.join(', ')}`,
        `Regola: "${memory.rules[3]}"`
      ],
      riskIfIgnored:
        'Ogni nuovo fronte rallenta LEGO, Brand Giuseppe e la pubblicazione — senza avvicinarti a libertà 2036.',
      reflectionQuestion:
        'Se potessi tenere solo due fronti per i prossimi 90 giorni, quali proteggerebbero davvero chi vuoi diventare?',
      recommendedAction:
        'Scrivi oggi quali fronti congeli per 30 giorni e torna alla priorità #1: pubblicare un pensiero vero.',
      weight:
        activeCount * 3 +
        (memory.priorities.some(priority => /congel/i.test(priority)) ? 4 : 0) +
        signals.dispersion,
      confidenceSignals: 4 + (activeCount >= 4 ? 2 : 0)
    },
    {
      id: 'liquidity-discipline',
      signalType: 'contradiction',
      insight: 'Hai liquidità forte, ma la disciplina automatica non è ancora il centro del sistema.',
      whyItMatters:
        `${liquidityPhrase()}, ogni mese senza automazione è un mese in cui comprare libertà dipende dalla forza di volontà — non dal sistema.`,
      evidence: [
        `Obiettivo finanziario: "${memory.finance.main_goals[0]}"`,
        `Priorità: "${memory.priorities[1]}"`,
        `Pattern: "${memory.patterns[2]}"`,
        `Missione 2036: "${memory.mission_2036}"`
      ],
      riskIfIgnored:
        'La liquidità diventa status o comfort immediato invece di mesi di libertà verso casa a Copenaghen.',
      reflectionQuestion:
        'Quanti mesi di libertà stai comprando questo mese — e quanti ne stai solo tenendo in conto?',
      recommendedAction:
        'Imposta oggi un trasferimento mensile automatico verso ETF o fondo emergenza, prima di qualsiasi altra decisione finanziaria.',
      weight:
        (memory.finance.liquidity_tier === 'comfortable' ? 5 : 2) +
        (memory.priorities.some(priority => /automat/i.test(priority)) ? 4 : 0) +
        signals.finance,
      confidenceSignals: 5
    },
    {
      id: 'sacred-creative-stall',
      signalType: 'risk',
      insight: 'Il lavoro sacro creativo sta aspettando mentre i fronti attivi prendono tutta l\'energia.',
      whyItMatters:
        `La North Star parla di creare ciò che conta. ${slowActive.join(' e ')} sono capitale creativo sacro — ma restano in slow-active mentre la dispersione è il rischio principale.`,
      evidence: [
        `Progetti slow-active: ${slowActive.join(', ')}`,
        `Obiettivo creativo: "${memory.creative_goals[0]}"`,
        `Pattern: "${memory.patterns[0]}"`,
        `Regola: "${memory.rules[4]}"`
      ],
      riskIfIgnored:
        'Visceral Poems e UREES restano intenzioni eccellenti senza diventare prove pubbliche della persona che vuoi essere.',
      reflectionQuestion:
        'Quale singola opera creativa, se finita questa settimana, ti farebbe sentire più vicino a chi hai scelto di diventare?',
      recommendedAction:
        'Blocca 90 minuti senza distrazioni per una sola micro-versione finita di Visceral Poems o UREES.',
      weight:
        slowActive.length * 4 +
        (memory.patterns[0].includes('troppi progetti') ? 3 : 0) +
        signals.creative,
      confidenceSignals: 3 + slowActive.length
    },
    {
      id: 'reputation-gap',
      signalType: 'opportunity',
      insight: 'Vuoi visibilità, ma la strategia giusta è reputazione stimata — e la pubblicazione è in ritardo.',
      whyItMatters:
        `La missione 2036 richiede opzionalità e riconoscimento tra professionisti, non fama generica. "${memory.priorities[0]}" è la priorità #1 — ma resta un impegno, non ancora un'abitudine visibile.`,
      evidence: [
        `Pattern: "${memory.patterns[4]}"`,
        `Priorità: "${memory.priorities[0]}"`,
        `Obiettivo carriera: "${memory.career_goals[1]}"`,
        `Progetto: Medium/LinkedIn — ${memory.projects['Medium/LinkedIn']?.status}`
      ],
      riskIfIgnored:
        'Il talento resta privato mentre altri costruiscono la reputazione che tu stai rimandando.',
      reflectionQuestion:
        'Quale pensiero vero, se pubblicato questa settimana, mostrerebbe come pensi — non solo cosa fai?',
      recommendedAction:
        'Scrivi in 30 minuti una bozza su un problema reale risolto questa settimana e pubblicala senza perfezionarla all\'infinito.',
      weight:
        (memory.priorities[0].includes('pubblic') ? 5 : 2) +
        (memory.projects['Medium/LinkedIn']?.status === 'active' ? 2 : 0) +
        signals.reputation,
      confidenceSignals: 4
    },
    {
      id: 'lego-accelerator',
      signalType: 'opportunity',
      insight: 'LEGO è il motore principale — ma ownership e visibilità non stanno ancora lavorando al massimo per libertà 2036.',
      whyItMatters:
        `LEGO non è la destinazione: è l'acceleratore. "${memory.career_goals[0]}" e "${memory.career_goals[2]}" devono convertire reddito e reputazione in opzionalità futura.`,
      evidence: [
        `Progetto LEGO: "${memory.projects.LEGO.role}"`,
        `Obiettivo carriera: "${memory.career_goals[0]}"`,
        `Entrate: ${incomeLabel()}`,
        `Missione 2036: "${memory.mission_2036}"`
      ],
      riskIfIgnored:
        'LEGO resta un buon lavoro invece di diventare il ponte misurabile verso la libertà di scegliere.',
      reflectionQuestion:
        'Quale conversazione di ownership, se fatta questa settimana, aumenterebbe il tuo impatto e la tua opzionalità?',
      recommendedAction:
        'Prepara tre esempi concreti di impatto e chiedi un incontro di 20 minuti con un leader LEGO chiave.',
      weight:
        (memory.projects.LEGO?.status === 'active' ? 4 : 0) +
        (memory.projects.LEGO?.status === 'active' ? 3 : 0),
      confidenceSignals: 3
    }
  ];
}

function confidenceFromSignals(signals: number, weight: number): number {
  const base = 50 + signals * 6 + Math.min(weight, 12);
  return clamp(Math.round(base), 55, 92);
}

export function runAwarenessEngine(input: { decisionHistory?: DecisionRecord[]; proactive?: boolean } = {}): AwarenessInsight {
  const history = input.decisionHistory ?? [];
  const ranked = buildCandidates(history).sort((a, b) => b.weight - a.weight);
  const top = ranked[0];

  return {
    headline: 'I noticed something.',
    insight: top.insight,
    whyItMatters: top.whyItMatters,
    evidence: top.evidence,
    riskIfIgnored: top.riskIfIgnored,
    reflectionQuestion: top.reflectionQuestion,
    recommendedAction: top.recommendedAction,
    confidenceScore: confidenceFromSignals(top.confidenceSignals, top.weight),
    signalType: top.signalType,
    proactive: input.proactive ?? false
  };
}
