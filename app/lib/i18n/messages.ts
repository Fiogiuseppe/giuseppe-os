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
      insights: 'Insight',
      create: 'Crea',
      memory: 'Memoria'
    },
    navRole: {
      today: 'Guida del mattino',
      decisions: 'Partner decisionale',
      insights: 'Osservazione nel tempo',
      create: 'Energia creativa',
      memory: 'Costituzione personale'
    },
    status: { online: 'ONLINE' },
    viewHeadings: {
      today: 'COSA HA MASSIMA LEVA OGGI?',
      decisions: 'QUAL È LA MIGLIORE DECISIONE CHE POSSO PRENDERE?',
      insights: 'COSA NON STO VEDENDO?',
      create: 'COSA MERITA LA MIA ENERGIA?',
      memory: 'CHI VOGLIO CONTINUARE A ESSERE?'
    },
    sectionQuestions: {
      today: 'Qual è la cosa a massima leva che posso fare oggi?',
      decisions: 'Qual è la migliore decisione che posso prendere?',
      insights: 'Cosa non sto vedendo?',
      create: 'Cosa merita la mia energia?',
      memory: 'Chi voglio continuare a essere?'
    },
    kickers: shared.kickers,
    today: {
      loading: 'Giuseppe OS sta pensando…',
      understand: 'Capisci questo',
      trajectoryImpact: 'Impatto traiettoria',
      possibleActions: 'Azioni possibili',
      briefingNote: 'Il Daily Brief è giudizio, non informazione.'
    },
    decisions: {
      headline: 'Porta una decisione. Il sistema simula prima di rispondere.',
      subline: 'Non un ordine — una raccomandazione ragionata.',
      simulating: 'Simulazione scenari in corso…',
      scenarioTitle: 'SCENARI',
      scenarioNote: 'Il Decision Simulator confronterà futuri possibili — mai certezze false.',
      whyBody: 'Ogni decisione importante passa da Past, Present e Future Giuseppe.',
      boardBody: 'Il Board esamina trade-off, rischi e allineamento con la traiettoria.',
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
      submit: 'Simula e raccomanda',
      submitting: 'Simulazione in corso…',
      mission2036: 'Missione 2036'
    },
    insights: {
      patternsTitle: 'PATTERN OSSERVATI',
      blindSpotsTitle: 'PUNTI CIECI',
      builtOverTime: 'Costruito nel tempo — non aggiornato ogni giorno.'
    },
    create: {
      strategistHeadline: 'Dove va la tua energia creativa adesso?',
      strategistSubline: 'Ogni progetto deve rafforzare la traiettoria — non disperdere attenzione.',
      focusLabel: 'FOCUS SUGGERITO'
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
      understand: 'Capisci questo',
      patterns: 'Pattern',
      blindSpots: 'Punti ciechi',
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
    footer: {
      about: 'About'
    },
    about: {
      back: 'Giuseppe OS',
      title: 'Giuseppe OS',
      subtitle: 'Il tuo Sé operativo.',
      description: 'Aiutarti a diventare chi scegli di essere.',
      aboutHeading: 'About',
      aboutBody1:
        'Giuseppe OS ti aiuta a prendere decisioni migliori, capire te stesso e crescere con intenzione.',
      aboutBody2:
        'Collega continuamente il tuo passato, il presente, le ambizioni e il mondo che cambia per rivelare pattern, opportunità e conseguenze difficili da vedere da soli.',
      productHeading: 'Il prodotto',
      products: {
        today: {
          name: 'Oggi',
          desc: 'Guida quotidiana per la tua azione a massima leva.'
        },
        decisions: {
          name: 'Decisioni',
          desc: 'Uno spazio per pensare prima di scegliere.'
        },
        insights: {
          name: 'Insight',
          desc: 'Pattern e osservazioni che probabilmente non noteresti da solo.'
        },
        create: {
          name: 'Crea',
          desc: 'Focus e direzione per tutto ciò che stai costruendo.'
        },
        memory: {
          name: 'Memoria',
          desc: 'Un posto per ricordare chi sei e chi scegli di diventare.'
        }
      },
      version: 'v0.1',
      tagline: 'Un progetto per tutta la vita.'
    },
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
      insights: 'Insights',
      create: 'Create',
      memory: 'Memory'
    },
    navRole: {
      today: 'Morning guide',
      decisions: 'Decision partner',
      insights: 'Observation over time',
      create: 'Creative energy',
      memory: 'Personal constitution'
    },
    status: { online: 'ONLINE' },
    viewHeadings: {
      today: 'WHAT HAS THE HIGHEST LEVERAGE TODAY?',
      decisions: 'WHAT IS THE BEST DECISION I CAN MAKE?',
      insights: 'WHAT AM I NOT SEEING?',
      create: 'WHAT DESERVES MY ENERGY?',
      memory: 'WHO DO I WANT TO CONTINUE BEING?'
    },
    sectionQuestions: {
      today: 'What is the highest leverage thing I can do today?',
      decisions: 'What is the best decision I can make?',
      insights: 'What am I not seeing?',
      create: 'What deserves my energy?',
      memory: 'Who do I want to continue being?'
    },
    kickers: shared.kickers,
    today: {
      loading: 'Giuseppe OS is thinking…',
      understand: 'Understand this',
      trajectoryImpact: 'Trajectory impact',
      possibleActions: 'Possible actions',
      briefingNote: 'The Daily Brief is judgement, not information.'
    },
    decisions: {
      headline: 'Bring a decision. The system simulates before answering.',
      subline: 'Not an order — a reasoned recommendation.',
      simulating: 'Simulating scenarios…',
      scenarioTitle: 'SCENARIOS',
      scenarioNote: 'The Decision Simulator will compare possible futures — never false certainty.',
      whyBody: 'Every important decision passes through Past, Present, and Future Giuseppe.',
      boardBody: 'The Board examines trade-offs, risks, and trajectory alignment.',
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
      submit: 'Simulate & recommend',
      submitting: 'Simulating…',
      mission2036: '2036 Mission'
    },
    insights: {
      patternsTitle: 'OBSERVED PATTERNS',
      blindSpotsTitle: 'BLIND SPOTS',
      builtOverTime: 'Built over time — not updated every day.'
    },
    create: {
      strategistHeadline: 'Where should your creative energy go right now?',
      strategistSubline: 'Every project must strengthen trajectory — not scatter attention.',
      focusLabel: 'SUGGESTED FOCUS'
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
      understand: 'Understand this',
      patterns: 'Patterns',
      blindSpots: 'Blind spots',
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
    footer: {
      about: 'About'
    },
    about: {
      back: 'Giuseppe OS',
      title: 'Giuseppe OS',
      subtitle: 'Your Operating Self.',
      description: 'Helping you become who you choose to be.',
      aboutHeading: 'About',
      aboutBody1:
        'Giuseppe OS helps you make better decisions, understand yourself and grow with intention.',
      aboutBody2:
        'It continuously connects your past, your present, your ambitions and the changing world to reveal patterns, opportunities and consequences that are difficult to see alone.',
      productHeading: 'The Product',
      products: {
        today: {
          name: 'Today',
          desc: 'Daily guidance for your highest leverage action.'
        },
        decisions: {
          name: 'Decisions',
          desc: 'A place to think before making important choices.'
        },
        insights: {
          name: 'Insights',
          desc: "Patterns and observations you probably wouldn't notice yourself."
        },
        create: {
          name: 'Create',
          desc: "Focus and direction for everything you're building."
        },
        memory: {
          name: 'Memory',
          desc: 'A place to remember who you are and who you choose to become.'
        }
      },
      version: 'v0.1',
      tagline: 'A lifelong project.'
    },
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
