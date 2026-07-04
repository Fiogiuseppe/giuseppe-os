import type { LongTermMemory, WorkingMemory } from '../brain/types';
import type { OracleEvidence } from './types';

/** Test fixtures only — not real Giuseppe data. */
export const SAMPLE_LONG_TERM_MEMORY: LongTermMemory = {
  decisions: [
    {
      id: 'dec-1',
      decision: 'Aprire un nuovo progetto SaaS laterale',
      reason: 'Entusiasmo per una nuova idea senza chiudere i fronti aperti',
      category: 'projects',
      timestamp: '2026-06-12T09:00:00.000Z',
      outcome: 'Due mesi persi, nessun revenue, energia divisa',
      outcomeRating: 2
    },
    {
      id: 'dec-2',
      decision: 'Pubblicare un pensiero su LinkedIn ogni martedì',
      reason: 'Compounding reputazionale verso libertà 2036',
      category: 'reputation',
      timestamp: '2026-06-18T18:00:00.000Z',
      outcome: 'Tre post pubblicati, due conversazioni ad alto valore',
      outcomeRating: 8
    },
    {
      id: 'dec-3',
      decision: 'Rifiutare consulenza a tempo pieno',
      reason: 'Proteggere concentrazione su North Star',
      category: 'career',
      timestamp: '2026-06-22T11:00:00.000Z',
      outcome: 'Runway intatto, più spazio per creare',
      outcomeRating: 9
    },
    {
      id: 'dec-4',
      decision: 'Guardare Netflix fino a tardi invece di chiudere una decisione aperta',
      reason: 'Stanchezza e scrolling',
      category: 'energy',
      timestamp: '2026-06-28T22:30:00.000Z',
      outcome: 'Mattina successiva lenta, decisione rimandata',
      outcomeRating: 3
    }
  ],
  lessons: [],
  patterns_detected: [
    'dispersione: troppi progetti aperti',
    'reputazione: pubblicazione saltata quando la settimana si riempie'
  ],
  insight_history: []
};

export const SAMPLE_WORKING_MEMORY: WorkingMemory = {
  sessions: [
    {
      id: 'sess-1',
      timestamp: '2026-07-02T08:00:00.000Z',
      intent: 'decide',
      summary: 'Decisione su progetto freelance',
      query: ''
    },
    {
      id: 'sess-2',
      timestamp: '2026-07-03T08:00:00.000Z',
      intent: 'decide',
      summary: 'Decisione su pubblicazione',
      query: ''
    },
    {
      id: 'sess-3',
      timestamp: '2026-07-04T08:00:00.000Z',
      intent: 'decide',
      summary: 'Decisione su concentrazione',
      query: ''
    }
  ],
  notes: [],
  records: []
};

export const SAMPLE_ORACLE_EVIDENCE: OracleEvidence = {
  topic: undefined,
  gatheredAt: '2026-07-04T12:00:00.000Z',
  backend: 'memory',
  decisions: {
    meta: { insufficientData: false, recordCount: 4 },
    records: [
      {
        id: 'dec-1',
        decision: 'Aprire un nuovo progetto SaaS laterale',
        reason: 'Entusiasmo per una nuova idea senza chiudere i fronti aperti',
        category: 'projects',
        timestamp: '2026-06-12T09:00:00.000Z',
        outcome: 'Due mesi persi, nessun revenue, energia divisa',
        outcomeRating: 2,
        weakensTrajectory: true,
        strengthensTrajectory: false
      },
      {
        id: 'dec-2',
        decision: 'Pubblicare un pensiero su LinkedIn ogni martedì',
        reason: 'Compounding reputazionale verso libertà 2036',
        category: 'reputation',
        timestamp: '2026-06-18T18:00:00.000Z',
        outcome: 'Tre post pubblicati, due conversazioni ad alto valore',
        outcomeRating: 8,
        weakensTrajectory: false,
        strengthensTrajectory: true
      },
      {
        id: 'dec-3',
        decision: 'Rifiutare consulenza a tempo pieno',
        reason: 'Proteggere concentrazione su North Star',
        category: 'career',
        timestamp: '2026-06-22T11:00:00.000Z',
        outcome: 'Runway intatto, più spazio per creare',
        outcomeRating: 9,
        weakensTrajectory: false,
        strengthensTrajectory: true
      },
      {
        id: 'dec-4',
        decision: 'Guardare Netflix fino a tardi invece di chiudere una decisione aperta',
        reason: 'Stanchezza e scrolling',
        category: 'energy',
        timestamp: '2026-06-28T22:30:00.000Z',
        outcome: 'Mattina successiva lenta, decisione rimandata',
        outcomeRating: 3,
        weakensTrajectory: true,
        strengthensTrajectory: false
      }
    ]
  },
  outcomes: {
    meta: { insufficientData: false, recordCount: 4 },
    records: [
      {
        decisionId: 'dec-1',
        decision: 'Aprire un nuovo progetto SaaS laterale',
        outcome: 'Due mesi persi, nessun revenue, energia divisa',
        rating: 2,
        timestamp: '2026-06-12T09:00:00.000Z'
      },
      {
        decisionId: 'dec-2',
        decision: 'Pubblicare un pensiero su LinkedIn ogni martedì',
        outcome: 'Tre post pubblicati, due conversazioni ad alto valore',
        rating: 8,
        timestamp: '2026-06-18T18:00:00.000Z'
      }
    ]
  },
  frequencies: {
    meta: { insufficientData: false, recordCount: 4 },
    counts: [
      {
        id: 'trajectory_strength_vs_weak',
        label: 'trajectory_alignment',
        countA: 2,
        countB: 2,
        total: 4,
        description:
          '2 out of 4 recorded decisions align with strengthens-trajectory signals; 2 align with weakens-trajectory signals; 0 neutral.'
      }
    ]
  },
  streaks: {
    meta: { insufficientData: false, recordCount: 2 },
    items: [
      {
        id: 'consecutive_decide_days',
        behavior: 'days_with_recorded_decision_session',
        consecutiveDays: 3,
        daysSinceLast: 0,
        lastOccurredAt: '2026-07-04T08:00:00.000Z',
        insufficientData: false
      },
      {
        id: 'days_since_weakens_decision',
        behavior: 'days_since_last_weakens_trajectory_decision',
        consecutiveDays: 0,
        daysSinceLast: 6,
        lastOccurredAt: '2026-06-28T22:30:00.000Z',
        insufficientData: false
      }
    ]
  },
  patterns: {
    meta: { insufficientData: false, recordCount: 2 },
    detected: [
      'dispersione: troppi progetti aperti',
      'reputazione: pubblicazione saltata quando la settimana si riempie'
    ]
  }
};

export const SAMPLE_ORACLE_OUTPUTS = {
  sufficientEvidence: {
    oneBigMove:
      'Ricordo quando apristi un nuovo SaaS laterale: 2 mesi persi, zero revenue. Quella dispersione mi costò libertà.',
    reflection:
      'Perché, dopo 2 decisioni su 4 che indeboliscono la traiettoria, continuo a lasciare che la settimana piena mi tolga la pubblicazione?'
  },
  insufficientOutcomes: {
    oneBigMove:
      'Non ho ancora abbastanza decisioni tue su questo per dirtelo con certezza — ma ogni scelta che registri da oggi mi rende più preciso.',
    reflection:
      'Quale pattern aperto vuoi che io possa misurare tra sei mesi — dispersione o reputazione?'
  },
  mixedStreak: {
    oneBigMove:
      'Tre giorni consecutivi con sessioni di decisione: io nel 2036 so che quella costanza ha cambiato tutto.',
    reflection:
      'Sei giorni fa scegliesti Netflix invece di chiudere una decisione — cosa stai ancora rimandando oggi?'
  }
} as const;
