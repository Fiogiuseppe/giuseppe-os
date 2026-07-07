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
      brands: 'Brands',
      create: 'Crea',
      memory: 'Memoria'
    },
    navRole: {
      today: 'Guida del mattino',
      decisions: 'Partner decisionale',
      insights: 'Osservazione nel tempo',
      brands: 'Momentum delle marche',
      create: 'Studio creativo',
      memory: 'Costituzione personale'
    },
    ai: {
      label: 'AI',
      offTooltip: 'Modalità locale. Nessuna richiesta AI.'
    },
    aiCards: {
      todayRecommendation: 'RACCOMANDAZIONE DI OGGI',
      decisionRecommendation: 'RACCOMANDAZIONE DECISIONALE',
      onlineInsight: 'INSIGHT ONLINE',
      nextAction: 'PROSSIMA AZIONE',
      alignment: 'ALLINEAMENTO',
      risks: 'RISCHI',
      emotionalBias: 'BIAS EMOTIVO',
      missingInfo: 'INFORMAZIONI MANCANTI'
    },
    viewHeadings: {
      today: 'COSA HA MASSIMA LEVA OGGI?',
      decisions: 'QUAL È LA MIGLIORE DECISIONE CHE POSSO PRENDERE?',
      insights: 'COSA NON STO VEDENDO?',
      brands: 'COME STANNO LE MIE MARCHE?',
      create: 'COSA VOGLIO CREARE?',
      memory: 'CHI VOGLIO CONTINUARE A ESSERE?'
    },
    sectionQuestions: {
      today: 'Qual è la cosa a massima leva che posso fare oggi?',
      decisions: 'Qual è la migliore decisione che posso prendere?',
      insights: 'Cosa non sto vedendo?',
      brands: 'Come stanno andando i miei motori di reddito e reputazione?',
      create: 'Cosa voglio creare adesso?',
      memory: 'Chi voglio continuare a essere?'
    },
    kickers: shared.kickers,
    today: {
      loading: 'Giuseppe OS sta pensando…',
      fallbackNotice: 'Briefing locale — l\'AI non era disponibile o il contesto era insufficiente.',
      understand: 'Capisci questo',
      trajectoryImpact: 'Impatto traiettoria',
      possibleActions: 'Azioni possibili',
      cards: {
        mindfulReflection: 'RIFLESSIONE',
        todayFocus: 'FOCUS DI OGGI',
        nextAction: 'PROSSIMA AZIONE',
        risk: 'DISTRAZIONE DA EVITARE',
        insight: 'INSIGHT PERSONALE'
      },
      ritual: {
        insight: 'Segnale',
        action: 'Mossa',
        reflection: 'Domanda'
      },
      execute: {
        writeMedium: 'Scrivilo su Medium',
        writeLinkedin: 'Scrivilo su LinkedIn',
        writeInstagram: 'Prepara la Story',
        openDecisions: 'Apri la decisione',
        prepare: 'Aiutami a farlo',
        loading: 'Sto preparando…',
        error: 'Non sono riuscito a preparare il contenuto.',
        notExecutable: 'Questa azione richiede un passo manuale oggi.'
      }
    },
    memory: {
      epigraph: 'Costituzione personale',
      whyLabel: 'Perché',
      howLabel: 'Come',
      whyText: 'Progettare una vita che mi renda libero di creare ciò che conta.',
      how1: 'Compra tempo, non status.',
      how2: 'Una cosa eccezionale vale più di dieci mediocri.',
      how3: 'Ogni decisione deve aumentare almeno un capitale.',
      how4: 'Scegli sempre verità e bellezza.',
      suggestionsLabel: 'Libri e podcast suggeriti',
      suggestionBook: 'Libro',
      suggestionPodcast: 'Podcast',
      companion: {
        label: 'Conversazione identità',
        lead: 'Parla con Giuseppe OS — resta coerente con chi sei, nella carriera e nella vita.',
        placeholder: 'Chi sono? Come mi presento? Cosa sto dimenticando di me?',
        send: 'Invia',
        thinking: 'Sto riflettendo…',
        you: 'Tu',
        os: 'Giuseppe OS',
        error: 'Non sono riuscito a rispondere.',
        empty: 'Risposta vuota.',
        checking: 'Verifico connessione…',
        ready: 'Chat attiva',
        offline: 'Chat non disponibile — manca la chiave AI sul server',
        evidenceItems: 'evidenze caricate',
        noEvidence: 'solo costituzione (nessuna evidenza sincronizzata)'
      }
    },
    content: {
      open: 'Genera contenuti',
      studioTitle: 'COSA VOGLIO SCRIVERE?',
      studioLead: 'Scrivi il tema. Sotto compaiono i contenuti pronti da pubblicare.',
      generate: 'Genera',
      loading: 'Sto scrivendo…',
      error: 'Non sono riuscito a generare i contenuti.',
      copyError: 'Copia non riuscita.',
      copied: 'Copiato',
      copy: 'Copia negli appunti',
      topicLabel: 'Tema',
      topicPlaceholder: 'Di cosa vuoi scrivere?',
      formatsLegend: 'Formati',
      formats: {
        medium: 'Medium',
        linkedin: 'LinkedIn',
        instagram: 'Instagram Story'
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
    weeklyBoard: {
      kicker: 'Settimana',
      title: 'Weekly Board',
      priorities: 'Priorità',
      doNotDo: 'Non fare',
      trajectory: 'Controllo traiettoria',
      dismiss: 'Chiudi',
      loading: 'Preparo il board settimanale…',
      error: 'Non ho potuto preparare il Weekly Board.'
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
      focusLabel: 'FOCUS SUGGERITO',
      energyNote: 'Energia creativa — un progetto alla volta.',
      ecosystemLabel: 'Ecosistema creativo'
    },
    brands: {
      strategistHeadline: 'Dove investire attenzione questo mese?',
      strategistSubline: 'Momentum delle marche — nessun saldo, solo segnali su come stanno andando i tuoi motori.',
      focusLabel: 'MARCA IN EVIDENZA',
      ecosystemLabel: 'Ecosistema brand',
      momentumLabel: 'Momentum',
      privacyNote: 'Nessun dato finanziario sensibile — solo traiettoria e concentrazione.'
    },
    createStudio: {
      lead: 'Carica reference, scrivi il brief, genera. Testo oggi — visuale e video in arrivo.',
      briefLabel: 'Brief creativo',
      briefPlaceholder: 'Cosa vuoi creare? Mood, messaggio, formato…',
      referencesLabel: 'Reference',
      addReference: 'Aggiungi file',
      removeReference: 'Rimuovi reference',
      referencesHint: 'Immagini, video, PDF o note — fino a 8 file.',
      outputLabel: 'Output',
      outputs: {
        text: 'Testo',
        visual: 'Visuale',
        video: 'Video'
      },
      comingSoon: 'presto',
      generate: 'Genera',
      note: 'Il contesto Identity e Memory guida l\'AI — non inventa fatti su di te.'
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
      exploreMemory: 'Continua a leggere',
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
        brands: {
          name: 'Brands',
          question: 'Come stanno le mie marche?'
        },
        create: {
          name: 'Crea',
          question: 'Cosa voglio creare?'
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
      brands: 'Brands',
      create: 'Create',
      memory: 'Memory'
    },
    navRole: {
      today: 'Morning guide',
      decisions: 'Decision partner',
      insights: 'Observation over time',
      brands: 'Brand momentum',
      create: 'Creative studio',
      memory: 'Personal constitution'
    },
    ai: {
      label: 'AI',
      offTooltip: 'Local mode. No AI requests.'
    },
    aiCards: {
      todayRecommendation: "TODAY'S RECOMMENDATION",
      decisionRecommendation: 'DECISION RECOMMENDATION',
      onlineInsight: 'ONLINE INSIGHT',
      nextAction: 'NEXT ACTION',
      alignment: 'ALIGNMENT',
      risks: 'RISKS',
      emotionalBias: 'EMOTIONAL BIAS',
      missingInfo: 'MISSING INFORMATION'
    },
    viewHeadings: {
      today: 'WHAT HAS THE HIGHEST LEVERAGE TODAY?',
      decisions: 'WHAT IS THE BEST DECISION I CAN MAKE?',
      insights: 'WHAT AM I NOT SEEING?',
      brands: 'HOW ARE MY BRANDS DOING?',
      create: 'WHAT DO I WANT TO CREATE?',
      memory: 'WHO DO I WANT TO CONTINUE BEING?'
    },
    sectionQuestions: {
      today: 'What is the highest leverage thing I can do today?',
      decisions: 'What is the best decision I can make?',
      insights: 'What am I not seeing?',
      brands: 'How are my income and reputation engines performing?',
      create: 'What do I want to create right now?',
      memory: 'Who do I want to continue being?'
    },
    kickers: shared.kickers,
    today: {
      loading: 'Giuseppe OS is thinking…',
      fallbackNotice: 'Local briefing — AI was unavailable or context was too thin.',
      understand: 'Understand this',
      trajectoryImpact: 'Trajectory impact',
      possibleActions: 'Possible actions',
      cards: {
        mindfulReflection: 'REFLECTION',
        todayFocus: "TODAY'S FOCUS",
        nextAction: 'NEXT ACTION',
        risk: 'DISTRACTION TO AVOID',
        insight: 'PERSONAL INSIGHT'
      },
      ritual: {
        insight: 'Signal',
        action: 'Move',
        reflection: 'Question'
      },
      execute: {
        writeMedium: 'Write it on Medium',
        writeLinkedin: 'Write it on LinkedIn',
        writeInstagram: 'Prepare the Story',
        openDecisions: 'Open the decision',
        prepare: 'Help me do it',
        loading: 'Preparing…',
        error: 'Could not prepare the content.',
        notExecutable: 'This action needs a manual step today.'
      }
    },
    memory: {
      epigraph: 'Personal constitution',
      whyLabel: 'Why',
      howLabel: 'How',
      whyText: 'Design a life that gives me the freedom to create what truly matters.',
      how1: 'Buy time, not status.',
      how2: 'Build one extraordinary thing instead of many average ones.',
      how3: 'Every decision should strengthen at least one form of capital.',
      how4: 'Always choose truth and beauty.',
      suggestionsLabel: 'Suggested books and podcasts',
      suggestionBook: 'Book',
      suggestionPodcast: 'Podcast',
      companion: {
        label: 'Identity conversation',
        lead: 'Talk with Giuseppe OS — stay coherent with who you are, in career and life.',
        placeholder: 'Who am I? How do I present myself? What am I forgetting about me?',
        send: 'Send',
        thinking: 'Thinking…',
        you: 'You',
        os: 'Giuseppe OS',
        error: 'Could not get a reply.',
        empty: 'Empty reply.',
        checking: 'Checking connection…',
        ready: 'Chat active',
        offline: 'Chat unavailable — AI key missing on server',
        evidenceItems: 'evidence items loaded',
        noEvidence: 'constitution only (no synced evidence)'
      }
    },
    content: {
      open: 'Generate content',
      studioTitle: 'WHAT DO I WANT TO WRITE?',
      studioLead: 'Write your topic. Ready-to-publish content appears below.',
      generate: 'Generate',
      loading: 'Writing…',
      error: 'Could not generate content.',
      copyError: 'Copy failed.',
      copied: 'Copied',
      copy: 'Copy to clipboard',
      topicLabel: 'Topic',
      topicPlaceholder: 'What do you want to write about?',
      formatsLegend: 'Formats',
      formats: {
        medium: 'Medium',
        linkedin: 'LinkedIn',
        instagram: 'Instagram Story'
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
    weeklyBoard: {
      kicker: 'Week',
      title: 'Weekly Board',
      priorities: 'Priorities',
      doNotDo: 'Do not do',
      trajectory: 'Trajectory check',
      dismiss: 'Dismiss',
      loading: 'Preparing the weekly board…',
      error: 'Could not prepare the Weekly Board.'
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
      focusLabel: 'SUGGESTED FOCUS',
      energyNote: 'Creative energy — one project at a time.',
      ecosystemLabel: 'Creative ecosystem'
    },
    brands: {
      strategistHeadline: 'Where should attention go this month?',
      strategistSubline: 'Brand momentum — no balances, only signals on how your engines are performing.',
      focusLabel: 'FEATURED BRAND',
      ecosystemLabel: 'Brand ecosystem',
      momentumLabel: 'Momentum',
      privacyNote: 'No sensitive financial data — trajectory and focus only.'
    },
    createStudio: {
      lead: 'Upload references, write the brief, generate. Text today — visual and video coming soon.',
      briefLabel: 'Creative brief',
      briefPlaceholder: 'What do you want to create? Mood, message, format…',
      referencesLabel: 'References',
      addReference: 'Add files',
      removeReference: 'Remove reference',
      referencesHint: 'Images, video, PDF, or notes — up to 8 files.',
      outputLabel: 'Output',
      outputs: {
        text: 'Text',
        visual: 'Visual',
        video: 'Video'
      },
      comingSoon: 'soon',
      generate: 'Generate',
      note: 'Identity and Memory context guides the AI — it does not invent facts about you.'
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
      exploreMemory: 'Continue reading',
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
        brands: {
          name: 'Brands',
          question: 'How are my brands doing?'
        },
        create: {
          name: 'Create',
          question: 'What do I want to create?'
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
