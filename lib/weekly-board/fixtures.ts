import type { WeeklyBoardResponse } from './types';

/** Test fixtures only — sample Weekly Board output shape. */
export const SAMPLE_WEEKLY_BOARD_RESPONSE: WeeklyBoardResponse = {
  priorities: [
    'Ricordo quando hai pubblicato ogni martedì: la reputazione è cresciuta più del lavoro extra.',
    'Proteggi un blocco creativo per Visceral Poems prima di aprire altro.',
    'Una conversazione di ownership dentro LEGO vale più di un altro side project.'
  ],
  doNotDo: [
    'Non aprire un nuovo SaaS laterale — l’ultima volta ha diviso energia per due mesi.',
    'Non comprare ansia con attività che non aumentano un capitale.',
    'Non rimandare la revisione delle decisioni prese questa settimana.'
  ],
  challenge: '7 giorni: 1 post vero, 1 decisione revisionata, 0 nuove idee.',
  trajectoryCheck:
    'Questa settimana ho visto tre decisioni registrate e due esiti revisionati. La traiettoria si rafforza quando pubblichi e proteggi concentrazione; si indebolisce quando apri fronti paralleli senza chiuderne uno.',
  source: 'mock',
  generatedAt: '2026-07-04T12:00:00.000Z',
  weekKey: '2026-W27',
  cached: false,
  pipeline: {
    evidenceDecisions: 3,
    evidenceOutcomes: 2,
    evidencePatterns: 2,
    thinEvidence: false,
    trajectoryNote: '2 reviewed outcomes in the last 7 days.'
  }
};
