/**
 * Groq on-demand pricing for llama-3.3-70b-versatile (official list price).
 * Source: https://groq.com/pricing — verified July 2026.
 */
export const GROQ_LLAMA_33_70B_PRICING = {
  model: 'llama-3.3-70b-versatile',
  inputUsdPerMillion: 0.59,
  outputUsdPerMillion: 0.79,
  sourceUrl: 'https://groq.com/pricing',
  verifiedAt: '2026-07-04'
} as const;

/** Approximate FX for personal € visibility — update if EUR/USD moves materially. */
export const USD_TO_EUR = 0.92;

export type UsageRecord = {
  provider: string;
  model: string;
  route: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  costEur: number;
  timestamp: string;
};

export type DailyUsageSummary = {
  dayKey: string;
  callCount: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  costEur: number;
  recentCalls: UsageRecord[];
};

const dailyStore = new Map<string, DailyUsageSummary>();
const MAX_RECENT_CALLS = 50;

function dayKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Copenhagen'
  }).format(now);
}

export function estimateGroqCostUsd(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1_000_000) * GROQ_LLAMA_33_70B_PRICING.inputUsdPerMillion +
    (outputTokens / 1_000_000) * GROQ_LLAMA_33_70B_PRICING.outputUsdPerMillion
  );
}

export function estimateProviderCost(params: {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}): { costUsd: number; costEur: number } {
  if (params.provider !== 'groq') {
    return { costUsd: 0, costEur: 0 };
  }

  const costUsd = estimateGroqCostUsd(params.inputTokens, params.outputTokens);
  return {
    costUsd,
    costEur: costUsd * USD_TO_EUR
  };
}

export function recordAiUsage(input: {
  provider: string;
  model: string;
  route: string;
  inputTokens: number;
  outputTokens: number;
}): UsageRecord {
  const { costUsd, costEur } = estimateProviderCost(input);
  const record: UsageRecord = {
    ...input,
    costUsd,
    costEur,
    timestamp: new Date().toISOString()
  };

  const key = dayKey();
  const existing = dailyStore.get(key) ?? {
    dayKey: key,
    callCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    costEur: 0,
    recentCalls: []
  };

  existing.callCount += 1;
  existing.inputTokens += input.inputTokens;
  existing.outputTokens += input.outputTokens;
  existing.costUsd += costUsd;
  existing.costEur += costEur;
  existing.recentCalls = [record, ...existing.recentCalls].slice(0, MAX_RECENT_CALLS);
  dailyStore.set(key, existing);

  return record;
}

export function getDailyUsage(now = new Date()): DailyUsageSummary {
  const key = dayKey(now);
  return (
    dailyStore.get(key) ?? {
      dayKey: key,
      callCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
      costEur: 0,
      recentCalls: []
    }
  );
}

export function resetDailyUsageForTests(): void {
  dailyStore.clear();
}

export function formatCostLogLine(record: UsageRecord, daily: DailyUsageSummary): string {
  const tokens = record.inputTokens + record.outputTokens;
  return `${record.provider} call (${record.route}): ~${tokens.toLocaleString()} tokens, ~€${record.costEur.toFixed(4)}, running today: €${daily.costEur.toFixed(4)}`;
}
