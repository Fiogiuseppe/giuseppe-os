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
    ai: {
      label: 'AI',
      offTooltip: 'Modalità locale. Nessuna richiesta AI.'
    },
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
      briefingNote: 'Il Daily Brief è giudizio, non informazione.',
      avatarHint: 'Il tuo avatar è interattivo.',
      ritual: {
        insight: 'Segnale',
        action: 'Mossa',
        reflection: 'Domanda'
      }
    },
    decisions: {
      openingPrompt: 'Cosa stai decidendo?',
      openingPlaceholder: 'Es. comprare casa, pubblicare un post, cambiare lavoro…',
      followupPlaceholder: 'La tua risposta…',
      continue: 'Continua',
      reasoning: 'Sto ragionando…',
      newDecision: 'Nuova decisione',
      simulating: 'Simulazione scenari in corso…',
      mission2036: 'Missione 2036',
      decisionLabel: 'Decisione'
    },
    decisionReview: {
      kicker: 'Prima di continuare…',
      beforeWeContinue: 'Prima di continuare…',
      daysAgo: '{days} giorni fa hai deciso:',
      howDidItGo: 'Com\'è andata?',
      start: 'Rivedi',
      didYouDoIt: 'L\'hai fatto davvero?',
      howSatisfied: 'Quanto sei soddisfatto?',
      sameDecision: 'Ripeteresti la stessa scelta?',
      whatLearned: 'Cosa hai imparato?',
      lessonPlaceholder: 'Una frase bastano…',
      skipLesson: 'Salta',
      saving: 'Salvo la lezione…',
      error: 'Non sono riuscito a salvare la revisione.',
      didIt: {
        yes: 'Sì',
        partial: 'In parte',
        no: 'No'
      },
      same: {
        yes: 'Sì',
        no: 'No',
        unsure: 'Non so'
      }
    },
    insights: {
      patternsTitle: 'PATTERN OSSERVATI',
      blindSpotsTitle: 'PUNTI CIECI',
      builtOverTime: 'Costruito nel tempo — non aggiornato ogni giorno.'
    },
    confidence: {
      learning: 'In apprendimento…',
      notEnoughData: 'Dati insufficienti.',
      score: 'score'
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
      progress: 'Progresso',
      readFullBrief: 'Leggi il briefing completo',
      exploreMemory: 'Esplora memoria completa',
      readAbout: 'Leggi di più',
      readProducts: 'Le cinque aree',
      closeReading: 'Chiudi'
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
      about: 'About',
      designedFor: 'Progettato per Giuseppe da',
      designerName: 'Giuseppe'
    },
    about: {
      back: 'Giuseppe OS',
      title: 'Giuseppe OS',
      subtitle: 'Il tuo Sé operativo.',
      description: 'Aiutarti a diventare chi scegli di essere.',
      aboutHeading: 'About',
      aboutBody1:
        'Un sistema di pensiero personale per prendere decisioni migliori, capirti più a fondo e restare connesso a chi scegli di diventare.',
      aboutBody2: 'Non pensa al posto tuo.',
      aboutBody3: 'Ti aiuta a pensare più chiaramente.',
      questionsHeading: 'Costruito attorno a cinque domande',
      products: {
        today: {
          name: 'Oggi',
          question: 'Cosa dovrei fare oggi?'
        },
        decisions: {
          name: 'Decisioni',
          question: 'Qual è la scelta migliore?'
        },
        insights: {
          name: 'Insight',
          question: 'Cosa non sto vedendo?'
        },
        create: {
          name: 'Crea',
          question: 'Cosa merita la mia energia?'
        },
        memory: {
          name: 'Memoria',
          question: 'Chi voglio continuare a essere?'
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
    ai: {
      label: 'AI',
      offTooltip: 'Local mode. No AI requests.'
    },
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
      briefingNote: 'The Daily Brief is judgement, not information.',
      avatarHint: 'Your avatar is interactive.',
      ritual: {
        insight: 'Signal',
        action: 'Move',
        reflection: 'Question'
      }
    },
    decisions: {
      openingPrompt: 'What are you deciding?',
      openingPlaceholder: 'E.g. buy a house, publish a post, change jobs…',
      followupPlaceholder: 'Your answer…',
      continue: 'Continue',
      reasoning: 'Reasoning…',
      newDecision: 'New decision',
      simulating: 'Simulating scenarios…',
      mission2036: '2036 Mission',
      decisionLabel: 'Decision'
    },
    decisionReview: {
      kicker: 'Before we continue…',
      beforeWeContinue: 'Before we continue…',
      daysAgo: '{days} days ago you decided:',
      howDidItGo: 'How did it go?',
      start: 'Review',
      didYouDoIt: 'Did you actually do it?',
      howSatisfied: 'How satisfied are you?',
      sameDecision: 'Would you make the same decision?',
      whatLearned: 'What did you learn?',
      lessonPlaceholder: 'One sentence is enough…',
      skipLesson: 'Skip',
      saving: 'Saving the lesson…',
      error: 'Could not save the review.',
      didIt: {
        yes: 'Yes',
        partial: 'Partly',
        no: 'No'
      },
      same: {
        yes: 'Yes',
        no: 'No',
        unsure: 'Unsure'
      }
    },
    insights: {
      patternsTitle: 'OBSERVED PATTERNS',
      blindSpotsTitle: 'BLIND SPOTS',
      builtOverTime: 'Built over time — not updated every day.'
    },
    confidence: {
      learning: 'Learning…',
      notEnoughData: 'Not enough data yet.',
      score: 'score'
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
      progress: 'Progress',
      readFullBrief: 'Read the full briefing',
      exploreMemory: 'Explore full memory',
      readAbout: 'Read more',
      readProducts: 'The five areas',
      closeReading: 'Close'
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
      about: 'About',
      designedFor: 'Designed for Giuseppe by',
      designerName: 'Giuseppe'
    },
    about: {
      back: 'Giuseppe OS',
      title: 'Giuseppe OS',
      subtitle: 'Your Operating Self.',
      description: 'Helping you become who you choose to be.',
      aboutHeading: 'About',
      aboutBody1:
        'A personal thinking system designed to help you make better decisions, understand yourself more deeply and stay connected to who you choose to become.',
      aboutBody2: "It doesn't think instead of you.",
      aboutBody3: 'It helps you think more clearly.',
      questionsHeading: 'Built around five questions',
      products: {
        today: {
          name: 'Today',
          question: 'What should I do today?'
        },
        decisions: {
          name: 'Decisions',
          question: 'What is the best choice?'
        },
        insights: {
          name: 'Insights',
          question: 'What am I not seeing?'
        },
        create: {
          name: 'Create',
          question: 'What deserves my energy?'
        },
        memory: {
          name: 'Memory',
          question: 'Who do I want to continue being?'
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
