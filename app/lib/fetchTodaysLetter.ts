import type { DailyBriefingResponse } from '../../lib/briefing/types';

export type FetchTodaysLetterResult =
  | { ok: true; letter: DailyBriefingResponse }
  | { ok: false; message: string; status: number };

export async function fetchTodaysLetter(): Promise<FetchTodaysLetterResult> {
  const response = await fetch('/api/todays-letter', { method: 'POST' });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        typeof body.error === 'string'
          ? body.error
          : 'Giuseppe OS non ha potuto preparare il briefing di oggi.'
    };
  }

  if ((!body.briefing && !body.letter) || !body.sections?.oneBigMove) {
    return {
      ok: false,
      status: 502,
      message: 'Briefing di oggi incompleto.'
    };
  }

  return {
    ok: true,
    letter: body as DailyBriefingResponse
  };
}
