import brain from '../memory/giuseppe_brain.json';
import { liquidityPhrase } from '../lib/publicFinance';
import type { AppLocale } from '../lib/i18n/locale';
import { pickLocale, resolveLocale } from '../lib/i18n/locale';
import {
  articleFallback,
  creativeChallengeDefault,
  creativeChallengeUrees,
  creativeChallengeVisceral,
  questionOfTheDay,
  weeklyFocusDefault
} from './content/potentialPickStrings';
import {
  assessEvidence,
  confidenceFromEvidence,
  type EvidenceLevel
} from '../lib/memory/evidence';
import type { LongTermMemory, WorkingMemory } from '../lib/brain/types';
import { buildEvidenceSnapshot } from '../lib/memory/insights';

export type OpportunityDimensions = {
  missionAlignment: number;
  longTermImpact: number;
  financialImpact: number;
  creativeGrowth: number;
  learning: number;
  networking: number;
  personalGrowth: number;
  freedom: number;
  riskOfDistraction: number;
  expectedRoi: number;
};

export type Opportunity = {
  title: string;
  reason: string;
  description: string;
  whyThisMatters: string;
  firstAction: string;
  estimatedImpact: 'low' | 'medium' | 'high' | 'transformative' | 'unknown';
  missionAlignment: string;
  timeRequired: string;
  energyRequired: 'low' | 'medium' | 'high';
  confidenceScore: number | null;
  confidenceLabel: 'learning' | 'notEnoughData' | 'score';
  hasEnoughData: boolean;
  evidenceLevel: EvidenceLevel;
  dimensions: OpportunityDimensions;
  totalScore: number | null;
  sourceProject?: string;
};

export type PotentialBrief = {
  todaysOpportunity: Opportunity;
  creativeChallenge: string;
  skillToLearn: string;
  personToContact: string;
  articleToRead: string;
  projectToFinish: string;
  riskToAvoid: string;
  questionOfTheDay: string;
  weeklyFocus: string;
  opportunityHistory: Opportunity[];
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

function clamp(value: number, min = 0, max = 10) {
  return Math.min(max, Math.max(min, value));
}

function scoreOpportunity(dimensions: OpportunityDimensions): number {
  return (
    dimensions.missionAlignment * 2 +
    dimensions.longTermImpact * 2 +
    dimensions.financialImpact +
    dimensions.creativeGrowth +
    dimensions.learning +
    dimensions.networking +
    dimensions.personalGrowth +
    dimensions.freedom * 1.5 +
    dimensions.expectedRoi * 1.5 -
    dimensions.riskOfDistraction * 2
  );
}

function impactLabel(score: number): Opportunity['estimatedImpact'] {
  if (score >= 55) return 'transformative';
  if (score >= 42) return 'high';
  if (score >= 28) return 'medium';
  return 'low';
}

function projectBoost(status: string): number {
  if (status === 'active') return 2;
  if (status === 'slow-active') return 1;
  if (status === 'selective') return 0;
  return -1;
}

function buildCandidates(locale: AppLocale): Array<{
  title: string;
  description: string;
  whyThisMatters: string;
  firstAction: string;
  missionAlignment: string;
  timeRequired: string;
  energyRequired: Opportunity['energyRequired'];
  sourceProject?: string;
  dimensions: OpportunityDimensions;
  confidenceSignals: number;
}> {
  const L = (it: string, en: string) => pickLocale(locale, it, en);
  const templates = [
    {
      title: L('Pubblica un pensiero vero su LinkedIn', 'Publish a true thought on LinkedIn'),
      description: L(
        'Trasforma un insight LEGO, creativo o finanziario in un post che mostra come pensi — non cosa fai.',
        'Turn a LEGO, creative, or financial insight into a post that shows how you think — not what you do.'
      ),
      whyThisMatters: L(
        'La reputazione stimata tra professionisti è la strategia corretta verso libertà 2036, non la fama generica.',
        'Esteem among professionals is the right strategy toward freedom 2036, not generic fame.'
      ),
      firstAction: L(
        'Scrivi in 30 minuti una bozza su un problema reale che hai risolto questa settimana.',
        'Draft in 30 minutes a post about a real problem you solved this week.'
      ),
      missionAlignment: L(
        'Aumenta capitale reputazionale senza sacrificare verità.',
        'Increases reputation capital without sacrificing truth.'
      ),
      timeRequired: '45 min',
      energyRequired: 'medium' as const,
      sourceProject: 'Medium/LinkedIn',
      dimensions: {
        missionAlignment: 9,
        longTermImpact: 8,
        financialImpact: 4,
        creativeGrowth: 7,
        learning: 5,
        networking: 8,
        personalGrowth: 7,
        freedom: 8,
        riskOfDistraction: 2,
        expectedRoi: 8
      },
      confidenceSignals: 4
    },
    {
      title: L('Automatizza il trasferimento ETF', 'Automate ETF transfer'),
      description: L('Imposta o aumenta un trasferimento mensile automatico verso investimenti — compra mesi di libertà, non status.', 'Set or increase an automatic monthly transfer to investments — buy months of freedom, not status.'),
      whyThisMatters: `${liquidityPhrase()}, ${L('la disciplina automatica protegge il percorso verso casa e libertà 2036.', 'automatic discipline protects the path toward home and freedom 2036.')}`,
      firstAction: L('Apri la banca e imposta un trasferimento fisso mensile verso ETF o fondo emergenza.', 'Open your bank and set a fixed monthly transfer to ETF or emergency fund.'),
      missionAlignment: L('Converte liquidità in opzionalità futura.', 'Converts liquidity into future optionality.'),
      timeRequired: '20 min',
      energyRequired: 'low' as const,
      sourceProject: 'Brand Giuseppe',
      dimensions: {
        missionAlignment: 8,
        longTermImpact: 9,
        financialImpact: 10,
        creativeGrowth: 1,
        learning: 4,
        networking: 1,
        personalGrowth: 5,
        freedom: 9,
        riskOfDistraction: 1,
        expectedRoi: 9
      },
      confidenceSignals: 5
    },
    {
      title: L('Micro-sessione Visceral Poems', 'Visceral Poems micro-session'),
      description: L('Completa una singola opera sacra di altissima qualità — non una collezione, non una serie, una cosa finita.', 'Complete one sacred work of the highest quality — not a collection, not a series, one finished thing.'),
      whyThisMatters: L('Visceral Poems è capitale creativo sacro. Una micro-versione eccellente vale più di dieci abbozzi.', 'Visceral Poems is sacred creative capital. One excellent micro-version beats ten drafts.'),
      firstAction: L('Scegli un solo poem, definisci "finito" in una frase, e lavoraci 90 minuti senza distrazioni.', 'Pick one poem, define "finished" in one sentence, and work on it 90 minutes without distractions.'),
      missionAlignment: L('Protegge bellezza e verità creativa.', 'Protects beauty and creative truth.'),
      timeRequired: '90 min',
      energyRequired: 'high' as const,
      sourceProject: 'Visceral Poems',
      dimensions: {
        missionAlignment: 9,
        longTermImpact: 7,
        financialImpact: 2,
        creativeGrowth: 10,
        learning: 3,
        networking: 2,
        personalGrowth: 8,
        freedom: 6,
        riskOfDistraction: 3,
        expectedRoi: 7
      },
      confidenceSignals: 3
    },
    {
      title: L('Prototipo UREES — un solo pezzo', 'UREES prototype — one piece only'),
      description: L('Avanza un prototipo culto di altissima identità. Pochi pezzi, massima qualità, zero industrializzazione.', 'Advance a cult prototype of highest identity. Few pieces, maximum quality, zero industrialization.'),
      whyThisMatters: L('UREES deve diventare oggetto di culto, non moda di massa. Un prototipo eccellente è capitale creativo e reputazionale.', 'UREES must become a cult object, not mass fashion. An excellent prototype is creative and reputational capital.'),
      firstAction: L('Definisci materiali, dimensioni e vincolo di produzione per un solo pezzo prototipo.', 'Define materials, dimensions, and production constraint for one prototype piece.'),
      missionAlignment: L('Rafforza identità creativa Giuseppe.', 'Strengthens Giuseppe creative identity.'),
      timeRequired: '2 ore',
      energyRequired: 'high' as const,
      sourceProject: 'UREES',
      dimensions: {
        missionAlignment: 8,
        longTermImpact: 8,
        financialImpact: 3,
        creativeGrowth: 10,
        learning: 5,
        networking: 4,
        personalGrowth: 7,
        freedom: 5,
        riskOfDistraction: 4,
        expectedRoi: 6
      },
      confidenceSignals: 3
    },
    {
      title: L('Conversazione ownership dentro LEGO', 'Ownership conversation inside LEGO'),
      description: L('Una mossa di carriera che aumenta ownership, visibilità e reputazione — LEGO come acceleratore, non gabbia.', 'A career move that increases ownership, visibility, and reputation — LEGO as accelerator, not cage.'),
      whyThisMatters: memory.career_goals[0],
      firstAction: L('Prepara 3 esempi concreti di impatto e chiedi un incontro di 20 minuti con un leader chiave.', 'Prepare 3 concrete impact examples and request a 20-minute meeting with a key leader.'),
      missionAlignment: L('Allinea carriera a libertà 2036.', 'Aligns career to freedom 2036.'),
      timeRequired: '1 ora prep',
      energyRequired: 'medium' as const,
      sourceProject: 'LEGO',
      dimensions: {
        missionAlignment: 8,
        longTermImpact: 9,
        financialImpact: 7,
        creativeGrowth: 4,
        learning: 6,
        networking: 9,
        personalGrowth: 7,
        freedom: 7,
        riskOfDistraction: 3,
        expectedRoi: 8
      },
      confidenceSignals: 4
    },
    {
      title: L('One-pager Brand Giuseppe', 'Brand Giuseppe one-pager'),
      description: L('Consolida in una pagina chi è Giuseppe, cosa rappresenta, e come LEGO, UREES e Visceral si collegano.', 'Consolidate on one page who Giuseppe is, what he represents, and how LEGO, UREES, and Visceral connect.'),
      whyThisMatters: L('Il nome Giuseppe è la marca madre. Chiarezza di brand riduce dispersione.', 'The name Giuseppe is the parent brand. Brand clarity reduces dispersion.'),
      firstAction: L('Scrivi 5 bullet: chi sei, per chi, cosa offri, prove, prossimo passo pubblico.', 'Write 5 bullets: who you are, for whom, what you offer, proof, next public step.'),
      missionAlignment: L('Riduce dispersione e aumenta focus strategico.', 'Reduces dispersion and increases strategic focus.'),
      timeRequired: '60 min',
      energyRequired: 'medium' as const,
      sourceProject: 'Brand Giuseppe',
      dimensions: {
        missionAlignment: 9,
        longTermImpact: 8,
        financialImpact: 4,
        creativeGrowth: 6,
        learning: 4,
        networking: 5,
        personalGrowth: 6,
        freedom: 7,
        riskOfDistraction: 2,
        expectedRoi: 7
      },
      confidenceSignals: 4
    },
    {
      title: L('Calcolo fondo casa Copenaghen', 'Copenhagen home fund calculation'),
      description: L('Quantifica anticipo, costo mensile totale e mesi di runway persi prima di qualsiasi visita immobiliare.', 'Quantify down payment, total monthly cost, and months of runway lost before any property visit.'),
      whyThisMatters: L("Comprare casa deve aumentare libertà, non solo togliere l'affitto. I numeri prima dell'emozione.", 'Buying a home must increase freedom, not just remove rent. Numbers before emotion.'),
      firstAction: L('Crea un foglio con anticipo target, rate mensile, tasse e impatto su investimenti automatici.', 'Create a sheet with target down payment, monthly payment, taxes, and impact on automatic investments.'),
      missionAlignment: L('Protegge libertà finanziaria durante un obiettivo emotivo.', 'Protects financial freedom during an emotional goal.'),
      timeRequired: '45 min',
      energyRequired: 'low' as const,
      dimensions: {
        missionAlignment: 7,
        longTermImpact: 8,
        financialImpact: 9,
        creativeGrowth: 1,
        learning: 5,
        networking: 1,
        personalGrowth: 5,
        freedom: 8,
        riskOfDistraction: 2,
        expectedRoi: 8
      },
      confidenceSignals: 4
    },
    {
      title: L('Outreach freelance premium', 'Premium freelance outreach'),
      description: L('Contatta un solo cliente potenziale ad alto valore reputazionale — non volume, solo premium.', 'Contact one high-value reputational potential client — not volume, premium only.'),
      whyThisMatters: L('Freelance è selettivo: deve rafforzare reputazione e reddito senza dispersione.', 'Freelance is selective: it must strengthen reputation and income without dispersion.'),
      firstAction: L('Identifica un contatto e invia un messaggio personalizzato con un caso di impatto reale.', 'Identify one contact and send a personalized message with a real impact case.'),
      missionAlignment: L('Seconda fonte di reddito reputazionale.', 'Second reputational income source.'),
      timeRequired: '30 min',
      energyRequired: 'medium' as const,
      sourceProject: 'Freelance',
      dimensions: {
        missionAlignment: 6,
        longTermImpact: 6,
        financialImpact: 7,
        creativeGrowth: 3,
        learning: 4,
        networking: 7,
        personalGrowth: 5,
        freedom: 6,
        riskOfDistraction: 5,
        expectedRoi: 6
      },
      confidenceSignals: 2
    },
    {
      title: L('Congela un nuovo fronte per 30 giorni', 'Freeze a new front for 30 days'),
      description: L('Blocca esplicitamente ogni nuova idea o progetto per un mese e torna al fronte con priorità più alta.', 'Explicitly block every new idea or project for a month and return to the highest-priority front.'),
      whyThisMatters: memory.patterns[1],
      firstAction: L('Scrivi su carta: "Per 30 giorni non apro nuovi fronti" e torna alla priorità #1.', 'Write on paper: "For 30 days I open no new fronts" and return to priority #1.'),
      missionAlignment: L('Protegge concentrazione verso libertà 2036.', 'Protects concentration toward freedom 2036.'),
      timeRequired: '10 min',
      energyRequired: 'low' as const,
      dimensions: {
        missionAlignment: 9,
        longTermImpact: 8,
        financialImpact: 3,
        creativeGrowth: 2,
        learning: 3,
        networking: 1,
        personalGrowth: 8,
        freedom: 8,
        riskOfDistraction: 0,
        expectedRoi: 7
      },
      confidenceSignals: 5
    }
  ];

  return templates;
}

function mapTemplateToOpportunity(
  template: ReturnType<typeof buildCandidates>[number],
  assessment: ReturnType<typeof assessEvidence>
): Opportunity {
  const projects = memory.projects;
  const statusBoost = template.sourceProject
    ? projectBoost(projects[template.sourceProject]?.status ?? 'frozen')
    : 0;

  const adjusted: OpportunityDimensions = {
    ...template.dimensions,
    missionAlignment: clamp(template.dimensions.missionAlignment + (statusBoost > 0 ? 1 : 0)),
    riskOfDistraction: clamp(
      template.dimensions.riskOfDistraction + (statusBoost < 0 ? 2 : 0)
    )
  };

  if (template.sourceProject && projects[template.sourceProject]?.status === 'slow-active') {
    adjusted.creativeGrowth = clamp(adjusted.creativeGrowth + 1);
    adjusted.riskOfDistraction = clamp(adjusted.riskOfDistraction - 1);
  }

  const totalScore = assessment.hasEnoughForRanking ? scoreOpportunity(adjusted) : null;
  const confidence = confidenceFromEvidence(assessment, template.confidenceSignals + statusBoost);

  return {
    title: template.title,
    reason: template.whyThisMatters,
    description: template.description,
    whyThisMatters: template.whyThisMatters,
    firstAction: template.firstAction,
    estimatedImpact: totalScore !== null ? impactLabel(totalScore) : 'unknown',
    missionAlignment: template.missionAlignment,
    timeRequired: template.timeRequired,
    energyRequired: template.energyRequired,
    confidenceScore: confidence.value,
    confidenceLabel: confidence.labelKey,
    hasEnoughData: assessment.hasEnoughForRanking,
    evidenceLevel: assessment.level,
    dimensions: adjusted,
    totalScore,
    sourceProject: template.sourceProject
  };
}

function pickWeeklyFocus(locale: AppLocale): string {
  return memory.priorities[0] ?? weeklyFocusDefault(locale);
}

function pickCreativeChallenge(locale: AppLocale): string {
  const slowProjects = Object.entries(memory.projects).filter(([, p]) => p.status === 'slow-active');
  if (slowProjects.some(([name]) => name === 'Visceral Poems')) {
    return creativeChallengeVisceral(locale);
  }
  if (slowProjects.some(([name]) => name === 'UREES')) {
    return creativeChallengeUrees(locale);
  }
  return creativeChallengeDefault(locale);
}

function pickSkillToLearn(): string {
  const activeCount = Object.values(memory.projects).filter(p => p.status === 'active').length;
  if (activeCount >= 3) return memory.skills[3] ?? memory.skills[0];
  return memory.skills[1] ?? memory.skills[0];
}

function pickPersonToContact(): string {
  const lego = memory.projects.LEGO;
  if (lego?.status === 'active') return memory.contacts[0];
  return memory.contacts[1] ?? memory.contacts[0];
}

function pickArticleToRead(locale: AppLocale): string {
  return memory.reading_queue[0] ?? articleFallback(locale);
}

function pickProjectToFinish(): string {
  const slow = Object.entries(memory.projects)
    .filter(([, p]) => p.status === 'slow-active')
    .map(([name]) => name);
  if (slow.length > 0) return slow[0];
  const active = Object.entries(memory.projects)
    .filter(([, p]) => p.status === 'active')
    .map(([name]) => name);
  return active[0] ?? 'Brand Giuseppe';
}

function pickRiskToAvoid(selfModelSummary?: string): string {
  if (selfModelSummary?.toLowerCase().includes('intent without execution')) {
    return 'Intent without execution on similar decisions';
  }

  if (selfModelSummary?.toLowerCase().includes('needs attention')) {
    return memory.patterns[1] ?? memory.patterns[0];
  }

  return memory.patterns[0];
}

function pickQuestionOfTheDay(locale: AppLocale): string {
  const value = memory.values[Math.floor(Date.now() / 86400000) % memory.values.length];
  return questionOfTheDay(locale, value);
}

export type PotentialEngineInput = {
  longTerm?: LongTermMemory;
  working?: WorkingMemory;
  locale?: 'it' | 'en';
  selfModelSummary?: string;
};

export function runPotentialEngine(input: PotentialEngineInput = {}): PotentialBrief {
  const longTerm = input.longTerm ?? { decisions: [], lessons: [], patterns_detected: [], insight_history: [] };
  const working = input.working ?? { sessions: [], notes: [], records: [] };
  const assessment = assessEvidence(buildEvidenceSnapshot(longTerm, working));

  const locale = resolveLocale(input.locale);
  const ranked = buildCandidates(locale)
    .map(template => mapTemplateToOpportunity(template, assessment))
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

  const todaysOpportunity = ranked[0];
  const opportunityHistory = ranked.slice(1, 4);

  return {
    todaysOpportunity,
    creativeChallenge: pickCreativeChallenge(locale),
    skillToLearn: pickSkillToLearn(),
    personToContact: pickPersonToContact(),
    articleToRead: pickArticleToRead(locale),
    projectToFinish: pickProjectToFinish(),
    riskToAvoid: pickRiskToAvoid(input.selfModelSummary),
    questionOfTheDay: pickQuestionOfTheDay(locale),
    weeklyFocus: pickWeeklyFocus(locale),
    opportunityHistory
  };
}
