export type LiveAICallLog = {
  route: string;
  page?: string;
  reason?: string;
  provider: string;
  model: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  timestamp: string;
};

function estimateTokens(text: string): number {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }
  return Math.max(1, Math.ceil(normalized.length / 4));
}

export function logLiveAICall(input: Omit<LiveAICallLog, 'timestamp'>): void {
  const entry: LiveAICallLog = {
    ...input,
    timestamp: new Date().toISOString()
  };

  console.info('[ai-live-call]', JSON.stringify(entry));
}

export function estimateInputTokens(system: string, messages: Array<{ content: string }>): number {
  const combined = [system, ...messages.map(message => message.content)].join('\n');
  return estimateTokens(combined);
}

export function estimateOutputTokens(content: string): number {
  return estimateTokens(content);
}
