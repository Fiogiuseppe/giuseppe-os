import type { Locale } from './types';

const shared = {
  kickers: {
    recommendation: 'RECOMMENDATION',
    nextMove: 'NEXT MOVE',
    board: 'BOARD',
    boardDiscussion: 'BOARD DISCUSSION',
    confidence: 'CONFIDENCE',
    evidence: 'EVIDENCE FROM MEMORY',
    northStar: 'NORTH STAR',
    purposeEngine: 'PURPOSE ENGINE',
    insight: 'INSIGHT',
    reflect: 'REFLECT',
    recommendedAction: 'RECOMMENDED ACTION',
    freedomScore: 'FREEDOM SCORE',
    goals: 'GOALS',
    cashReserve: 'CASH RESERVE',
    income: 'INCOME',
    projectDetails: 'PROJECT DETAILS',
    strategist: 'STRATEGIST',
    cfo: 'CFO',
    oneBigMove: 'ONE BIG MOVE',
    reality: 'REALITY',
    opportunity: 'OPPORTUNITY',
    ignore: 'IGNORE',
    nourish: 'NOURISH',
    reflection: 'REFLECTION',
    memory: 'MEMORY',
    today: 'TODAY',
    decisionEngine: 'DECISION ENGINE',
    riskIfIgnored: 'RISK IF IGNORED',
    todaysOpportunity: "TODAY'S OPPORTUNITY",
    opportunityHistory: 'OPPORTUNITY HISTORY',
    creativeChallenge: 'CREATIVE CHALLENGE',
    skillToLearn: 'SKILL TO LEARN',
    personToContact: 'PERSON TO CONTACT',
    articleToRead: 'ARTICLE TO READ',
    projectToFinish: 'PROJECT TO FINISH',
    riskToAvoid: 'RISK TO AVOID',
    questionOfTheDay: 'QUESTION OF THE DAY',
    weeklyFocus: 'WEEKLY FOCUS',
    todaysProjectRecommendation: "TODAY'S PROJECT RECOMMENDATION"
  }
} as const;

export const messages = {
  it: {
    nav: {
      today: 'Oggi',
      decisions: 'Decisioni',
      discover: 'Scopri',
      create: 'Crea',
      memory: 'Memoria'
    },
    navRole: {
      today: 'Briefing quotidiano',
      decisions: 'Sala decisioni',
      discover: 'Scoperta silenziosa',
      create: 'Allocazione energia',
      memory: 'Palazzo della memoria'
    },
    status: { online: 'ONLINE' },
    viewHeadings: {
      today: 'IL MIGLIOR PASSO DI OGGI.',
      decisions: 'PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.',
      discover: 'HO NOTATO QUALCOSA.',
      create: 'IL SISTEMA GIUSEPPE.',
      memory: 'CHI HO SCELTO DI DIVENTARE.'
    },
    kickers: shared.kickers,
    today: {
      loading: 'Giuseppe OS sta pensando…',
      opportunity: 'Opportunità',
      ignoreToday: 'Ignora oggi',
      nourish: 'Nutri',
      reflection: 'Riflessione'
    },
    decisions: {
      headline: 'Pubblica un pensiero vero.',
      subline: 'Reputazione prima di perfezione.',
      whyBody: 'La reputazione stimata richiede prove pubbliche. Il perfezionismo è paura travestita da standard.',
      boardBody: 'Il Board concorda: concentrati su un pensiero vero, non su dieci bozze perfette.',
      cardNext: 'Pubblica un pensiero vero.',
      cardNextSub: 'Reputazione prima di perfezione.',
      cardCfo: 'Automatizza investimenti.',
      cardCfoSub: 'Compra libertà, non status.',
      cardStrategist: 'Congela una nuova idea.',
      cardStrategistSub: 'Il rischio è dispersione.',
      askBoard: 'Chiedi al Board.',
      decisionLabel: 'Decisione',
      decisionPlaceholder: 'Es. comprare casa, pubblicare un post, investire...',
      reasonLabel: 'Perché la vuoi fare?',
      reasonPlaceholder: 'Motivo vero.',
      submit: 'Chiedi al Board',
      submitting: 'Il Board sta pensando…',
      mission2036: 'Missione 2036'
    },
    discover: {
      freedomSubline: 'Stai comprando libertà, non status.',
      recHeadline: 'Automatizza investimenti.',
      recSubline: 'Misura mesi di libertà, non solo rendimento.'
    },
    create: {
      strategistHeadline: 'Non più idee: più concentrazione.',
      strategistSubline: 'Ogni progetto deve rafforzare l\'ecosistema.'
    },
    disclosure: {
      why: 'Perché?',
      showBoard: 'Mostra il Board',
      capitals: 'Sei capitali',
      betterVersion: 'Versione migliore',
      exploreOpportunities: 'Esplora opportunità',
      financialDetails: 'Dettagli finanziari',
      openProjects: 'Progetti aperti',
      boardDiscussion: 'Discussione Board',
      advisors: 'Consiglieri',
      evidence: 'Evidenza',
      confidence: 'Confidenza',
      explorePurpose: 'Esplora il proposito',
      tellMeMore: 'Dimmi di più',
      showEvidence: 'Mostra evidenza',
      reflect: 'Rifletti',
      suggestedAction: 'Azione suggerita',
      freedomFinance: 'Libertà e finanza',
      goals: 'Obiettivi',
      progress: 'Progresso'
    },
    decisionResult: {
      category: 'Categoria',
      nextStep: 'PROSSIMO PASSO',
      whyMatters: 'PERCHÉ CONTA',
      hiddenNeed: 'BISOGNO NASCOSTO',
      hiddenNeedLabel: 'Bisogno nascosto',
      biasLabel: 'Bias possibile',
      capitalsTitle: 'Sei capitali',
      betterTitle: 'Versione migliore'
    },
    potential: {
      whyMatters: 'Perché conta',
      firstAction: 'Prima azione',
      impact: 'Impatto',
      energy: 'energia',
      system: 'sistema',
      score: 'Score',
      confidence: 'confidence'
    },
    finance: {
      goalsTitle: 'Obiettivi finanziari.'
    },
    footer:
      'Non è software che ti dice cosa fare. È software che ricorda chi hai scelto di diventare.',
    language: {
      italian: 'IT',
      english: 'EN',
      switchLabel: 'Lingua dell\'interfaccia'
    },
    aria: {
      home: 'Giuseppe OS home',
      mainNav: 'Navigazione principale'
    }
  },
  en: {
    nav: {
      today: 'Today',
      decisions: 'Decisions',
      discover: 'Discover',
      create: 'Create',
      memory: 'Memory'
    },
    navRole: {
      today: 'Daily briefing',
      decisions: 'Decision room',
      discover: 'Quiet discovery',
      create: 'Energy allocation',
      memory: 'Memory palace'
    },
    status: { online: 'ONLINE' },
    viewHeadings: {
      today: "TODAY'S BEST MOVE.",
      decisions: 'DESIGN A LIFE THAT SETS ME FREE TO CREATE WHAT MATTERS.',
      discover: 'I NOTICED SOMETHING.',
      create: 'THE GIUSEPPE SYSTEM.',
      memory: 'WHO I CHOSE TO BECOME.'
    },
    kickers: shared.kickers,
    today: {
      loading: 'Giuseppe OS is thinking…',
      opportunity: 'Opportunity',
      ignoreToday: 'Ignore today',
      nourish: 'Nourish',
      reflection: 'Reflection'
    },
    decisions: {
      headline: 'Publish one true thought.',
      subline: 'Reputation before perfection.',
      whyBody: 'Estimated reputation requires public proof. Perfectionism is fear dressed as standards.',
      boardBody: 'The Board agrees: focus on one true thought, not ten perfect drafts.',
      cardNext: 'Publish one true thought.',
      cardNextSub: 'Reputation before perfection.',
      cardCfo: 'Automate investments.',
      cardCfoSub: 'Buy freedom, not status.',
      cardStrategist: 'Freeze a new idea.',
      cardStrategistSub: 'The risk is dispersion.',
      askBoard: 'Ask the Board.',
      decisionLabel: 'Decision',
      decisionPlaceholder: 'E.g. buy a house, publish a post, invest...',
      reasonLabel: 'Why do you want to do it?',
      reasonPlaceholder: 'The real reason.',
      submit: 'Ask the Board',
      submitting: 'The Board is thinking…',
      mission2036: '2036 Mission'
    },
    discover: {
      freedomSubline: 'You are buying freedom, not status.',
      recHeadline: 'Automate investments.',
      recSubline: 'Measure months of freedom, not just returns.'
    },
    create: {
      strategistHeadline: 'No more ideas: more focus.',
      strategistSubline: 'Every project must strengthen the ecosystem.'
    },
    disclosure: {
      why: 'Why?',
      showBoard: 'Show the Board',
      capitals: 'Six capitals',
      betterVersion: 'Better version',
      exploreOpportunities: 'Explore opportunities',
      financialDetails: 'Financial details',
      openProjects: 'Open projects',
      boardDiscussion: 'Board discussion',
      advisors: 'Advisors',
      evidence: 'Evidence',
      confidence: 'Confidence',
      explorePurpose: 'Explore purpose',
      tellMeMore: 'Tell me more',
      showEvidence: 'Show evidence',
      reflect: 'Reflect',
      suggestedAction: 'Suggested action',
      freedomFinance: 'Freedom & finance',
      goals: 'Goals',
      progress: 'Progress'
    },
    decisionResult: {
      category: 'Category',
      nextStep: 'NEXT STEP',
      whyMatters: 'WHY IT MATTERS',
      hiddenNeed: 'HIDDEN NEED',
      hiddenNeedLabel: 'Hidden need',
      biasLabel: 'Possible bias',
      capitalsTitle: 'Six capitals',
      betterTitle: 'Better version'
    },
    potential: {
      whyMatters: 'Why it matters',
      firstAction: 'First action',
      impact: 'Impact',
      energy: 'energy',
      system: 'system',
      score: 'Score',
      confidence: 'confidence'
    },
    finance: {
      goalsTitle: 'Financial goals.'
    },
    footer:
      "It's not software that tells you what to do. It's software that remembers who you chose to become.",
    language: {
      italian: 'IT',
      english: 'EN',
      switchLabel: 'Interface language'
    },
    aria: {
      home: 'Giuseppe OS home',
      mainNav: 'Main navigation'
    }
  }
} satisfies Record<Locale, Record<string, unknown>>;

export type Messages = (typeof messages)['it'];

function resolvePath(tree: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, tree);
  return typeof value === 'string' ? value : path;
}

export function translate(locale: Locale, key: string): string {
  return resolvePath(messages[locale] as Record<string, unknown>, key);
}
