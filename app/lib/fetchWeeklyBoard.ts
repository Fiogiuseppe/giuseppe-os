import type { WeeklyBoardResponse } from '../../lib/weekly-board/types';

export type FetchWeeklyBoardResult =
  | { ok: true; board: WeeklyBoardResponse }
  | { ok: false; message: string; status: number };

export type FetchWeeklyBoardOptions = {
  regenerate?: boolean;
};

export async function fetchWeeklyBoard(
  locale: 'it' | 'en' = 'it',
  options: FetchWeeklyBoardOptions = {}
): Promise<FetchWeeklyBoardResult> {
  const response = await fetch('/api/weekly-board', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locale,
      regenerate: options.regenerate === true
    })
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        typeof body.error === 'string'
          ? body.error
          : 'Giuseppe OS non ha potuto preparare il Weekly Board.'
    };
  }

  if (!Array.isArray(body.priorities) || typeof body.challenge !== 'string') {
    return {
      ok: false,
      status: 502,
      message: 'Weekly Board incompleto.'
    };
  }

  return {
    ok: true,
    board: body as WeeklyBoardResponse
  };
}
