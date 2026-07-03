import brain from '../memory/giuseppe_brain.json';

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
  description: string;
  whyThisMatters: string;
  firstAction: string;
  estimatedImpact: 'low' | 'medium' | 'high' | 'transformative';
  missionAlignment: string;
  timeRequired: string;
  energyRequired: 'low' | 'medium' | 'high';
  confidenceScore: number;
  dimensions: OpportunityDimensions;
  totalScore: number;
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

function confidenceFromSignals(signals: number): number {
  return clamp(Math.round(55 + signals * 8), 0, 100);
}

function projectBoost(status: string): number {
  if (status === 'active') return 2;
  if (status === 'slow-active') return 1;
  if (status === 'selective') return 0;
  return -1;
}

function buildCandidates(): Opportunity[] {
  const projects = memory.projects;

  const templates: Array<{
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
  }> = [
    {
      title: 'Pubblica un pensiero vero su LinkedIn',
      description:
        'Trasforma un insight LEGO, creativo o finanziario in un post che mostra come pensi — non cosa fai.',
      whyThisMatters:
        'La reputazione stimata tra professionisti è la strategia corretta verso libertà 2036, non la fama generica.',
      firstAction: 'Scrivi in 30 minuti una bozza su un problema reale che hai risolto questa settimana.',
      missionAlignment: 'Aumenta capitale reputazionale senza sacrificare verità.',
      timeRequired: '45 min',
      energyRequired: 'medium',
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
      title: 'Automatizza il trasferimento ETF',
      description:
        'Imposta o aumenta un trasferimento mensile automatico verso investimenti — compra mesi di libertà, non status.',
      whyThisMatters:
        `Con ${memory.finance.cash_dkk.toLocaleString('it-IT')} DKK di liquidità, la disciplina automatica protegge il percorso verso casa e libertà 2036.`,
      firstAction: 'Apri la banca e imposta un trasferimento fisso mensile verso ETF o fondo emergenza.',
      missionAlignment: 'Converte liquidità in opzionalità futura.',
      timeRequired: '20 min',
      energyRequired: 'low',
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
      title: 'Micro-sessione Visceral Poems',
      description:
        'Completa una singola opera sacra di altissima qualità — non una collezione, non una serie, una cosa finita.',
      whyThisMatters:
        'Visceral Poems è capitale creativo sacro. Una micro-versione eccellente vale più di dieci abbozzi.',
      firstAction: 'Scegli un solo poem, definisci "finito" in una frase, e lavoraci 90 minuti senza distrazioni.',
      missionAlignment: 'Protegge bellezza e verità creativa.',
      timeRequired: '90 min',
      energyRequired: 'high',
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
      title: 'Prototipo UREES — un solo pezzo',
      description:
        'Avanza un prototipo culto di altissima identità. Pochi pezzi, massima qualità, zero industrializzazione.',
      whyThisMatters:
        'UREES deve diventare oggetto di culto, non moda di massa. Un prototipo eccellente è capitale creativo e reputazionale.',
      firstAction: 'Definisci materiali, dimensioni e vincolo di produzione per un solo pezzo prototipo.',
      missionAlignment: 'Rafforza identità creativa Giuseppe.',
      timeRequired: '2 ore',
      energyRequired: 'high',
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
      title: 'Conversazione ownership dentro LEGO',
      description:
        'Una mossa di carriera che aumenta ownership, visibilità e reputazione — LEGO come acceleratore, non gabbia.',
      whyThisMatters: memory.career_goals[0],
      firstAction: 'Prepara 3 esempi concreti di impatto e chiedi un incontro di 20 minuti con un leader chiave.',
      missionAlignment: 'Allinea carriera a libertà 2036.',
      timeRequired: '1 ora prep',
      energyRequired: 'medium',
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
      title: 'One-pager Brand Giuseppe',
      description:
        'Consolida in una pagina chi è Giuseppe, cosa rappresenta, e come LEGO, UREES e Visceral si collegano.',
      whyThisMatters: 'Il nome Giuseppe è la marca madre. Chiarezza di brand riduce dispersione.',
      firstAction: 'Scrivi 5 bullet: chi sei, per chi, cosa offri, prove, prossimo passo pubblico.',
      missionAlignment: 'Riduce dispersione e aumenta focus strategico.',
      timeRequired: '60 min',
      energyRequired: 'medium',
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
      title: 'Calcolo fondo casa Copenaghen',
      description:
        'Quantifica anticipo, costo mensile totale e mesi di runway persi prima di qualsiasi visita immobiliare.',
      whyThisMatters:
        'Comprare casa deve aumentare libertà, non solo togliere l\'affitto. I numeri prima dell\'emozione.',
      firstAction: 'Crea un foglio con anticipo target, rate mensile, tasse e impatto su investimenti automatici.',
      missionAlignment: 'Protegge libertà finanziaria durante un obiettivo emotivo.',
      timeRequired: '45 min',
      energyRequired: 'low',
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
      title: 'Outreach freelance premium',
      description:
        'Contatta un solo cliente potenziale ad alto valore reputazionale — non volume, solo premium.',
      whyThisMatters: 'Freelance è selettivo: deve rafforzare reputazione e reddito senza dispersione.',
      firstAction: 'Identifica un contatto e invia un messaggio personalizzato con un caso di impatto reale.',
      missionAlignment: 'Seconda fonte di reddito reputazionale.',
      timeRequired: '30 min',
      energyRequired: 'medium',
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
      title: 'Congela un nuovo fronte per 30 giorni',
      description:
        'Blocca esplicitamente ogni nuova idea o progetto per un mese e torna al fronte con priorità più alta.',
      whyThisMatters: memory.patterns[1],
      firstAction: 'Scrivi su carta: "Per 30 giorni non apro nuovi fronti" e torna alla priorità #1.',
      missionAlignment: 'Protegge concentrazione verso libertà 2036.',
      timeRequired: '10 min',
      energyRequired: 'low',
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

  return templates.map(template => {
    const statusBoost = template.sourceProject
      ? projectBoost(projects[template.sourceProject]?.status ?? 'frozen')
      : 0;

    const adjusted: OpportunityDimensions = {
      ...template.dimensions,
      missionAlignment: clamp(template.dimensions.missionAlignment + (statusBoost > 0 ? 1 : 0)),
      riskOfDistraction: clamp(
        template.dimensions.riskOfDistraction + (statusBoost < 0 ? 2 : 0) + (template.sourceProject ? 0 : 0)
      )
    };

    if (projects[template.sourceProject ?? '']?.status === 'slow-active') {
      adjusted.creativeGrowth = clamp(adjusted.creativeGrowth + 1);
      adjusted.riskOfDistraction = clamp(adjusted.riskOfDistraction - 1);
    }

    const totalScore = scoreOpportunity(adjusted);

    return {
      title: template.title,
      description: template.description,
      whyThisMatters: template.whyThisMatters,
      firstAction: template.firstAction,
      estimatedImpact: impactLabel(totalScore),
      missionAlignment: template.missionAlignment,
      timeRequired: template.timeRequired,
      energyRequired: template.energyRequired,
      confidenceScore: confidenceFromSignals(template.confidenceSignals + statusBoost),
      dimensions: adjusted,
      totalScore,
      sourceProject: template.sourceProject
    };
  });
}

function pickWeeklyFocus(): string {
  return memory.priorities[0] ?? 'Un passo verso libertà 2036.';
}

function pickCreativeChallenge(): string {
  const slowProjects = Object.entries(memory.projects).filter(([, p]) => p.status === 'slow-active');
  if (slowProjects.some(([name]) => name === 'Visceral Poems')) {
    return 'Scrivi un poem viscerale in meno di 40 righe — finito, non perfetto.';
  }
  if (slowProjects.some(([name]) => name === 'UREES')) {
    return 'Disegna un UREES che potresti spiegare in una frase a un estraneo.';
  }
  return 'Crea qualcosa di piccolo ma indimenticabile in 60 minuti.';
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

function pickArticleToRead(): string {
  return memory.reading_queue[0] ?? 'Un saggio che rafforza pensiero a lungo termine.';
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

function pickRiskToAvoid(): string {
  return memory.patterns[0];
}

function pickQuestionOfTheDay(): string {
  const value = memory.values[Math.floor(Date.now() / 86400000) % memory.values.length];
  return `Questa mossa aumenta ${value.toLowerCase()} — o solo sollievo immediato?`;
}

export function runPotentialEngine(): PotentialBrief {
  const ranked = buildCandidates().sort((a, b) => b.totalScore - a.totalScore);
  const todaysOpportunity = ranked[0];
  const opportunityHistory = ranked.slice(1, 4);

  return {
    todaysOpportunity,
    creativeChallenge: pickCreativeChallenge(),
    skillToLearn: pickSkillToLearn(),
    personToContact: pickPersonToContact(),
    articleToRead: pickArticleToRead(),
    projectToFinish: pickProjectToFinish(),
    riskToAvoid: pickRiskToAvoid(),
    questionOfTheDay: pickQuestionOfTheDay(),
    weeklyFocus: pickWeeklyFocus(),
    opportunityHistory
  };
}
