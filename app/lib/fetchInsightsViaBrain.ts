import type { AwarenessInsight } from '../../engine/awarenessEngine';
import type { InsightCard } from '../../lib/ai/insight-engine';

export type FetchInsightsResult =
  | {
      ok: true;
      awareness: AwarenessInsight;
      card?: InsightCard;
      source?: 'local' | 'live';
      cached?: boolean;
    }
  | { ok: false; message: string; status: number };

export type FetchInsightsOptions = {
  regenerate?: boolean;
};

export async function fetchInsightsViaBrain(
  locale: 'it' | 'en' = 'it',
  options: FetchInsightsOptions = {}
): Promise<FetchInsightsResult> {
  const response = await fetch('/api/insights', {
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
          : 'Giuseppe OS non ha potuto preparare l’insight mensile.'
    };
  }

  if (!body.insight) {
    return {
      ok: false,
      status: 502,
      message: 'Risposta insights incompleta.'
    };
  }

  return {
    ok: true,
    awareness: body.insight as AwarenessInsight,
    card: body.card as InsightCard | undefined,
    source: body.source,
    cached: body.cached
  };
}
