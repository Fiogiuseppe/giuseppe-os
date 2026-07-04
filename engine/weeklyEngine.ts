import { WEEKLY_BOARD_SYSTEM_PROMPT } from '../lib/oracle/weeklyPrompt';

export function generateWeeklyBoard() {
  return {
    priorities: [
      'Pubblica un pensiero reputazionale.',
      'Fai una scelta finanziaria concreta.',
      'Chiudi o congela un progetto aperto.'
    ],
    doNotDo: [
      'Non iniziare nuovi progetti.',
      'Non comprare per ansia.',
      'Non rifinire all’infinito.'
    ],
    challenge: '7 giorni: 1 post, 1 azione finanziaria, 1 relazione, 0 nuove idee.'
  };
}

/** Oracle voice + evidence-only rules for future weekly trajectory generation. */
export const weeklyBoardSystemPrompt = WEEKLY_BOARD_SYSTEM_PROMPT;
