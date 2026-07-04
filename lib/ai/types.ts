/**
 * Giuseppe OS AI orchestrator — provider-agnostic types.
 * Application code should import from here or orchestrator.ts only.
 */

export type OrchestratorProviderName = 'groq' | 'gemini' | 'claude' | 'openai' | 'ollama';

/** Reserved for future capability routing — not implemented yet. */
export type AICapability =
  | 'reasoning'
  | 'creative'
  | 'vision'
  | 'fast'
  | 'embeddings'
  | 'search';

export type AIMessageRole = 'user' | 'assistant' | 'system';

export type AIMessage = {
  role: AIMessageRole;
  content: string;
};

export type AIRequest = {
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** When true, providers that support JSON mode should request structured output. */
  expectJson?: boolean;
};

export type AIResponse = {
  content: string;
  model: string;
  provider: OrchestratorProviderName;
};

export type AIProviderMetadata = {
  endpoint: string;
  defaultModel: string;
  configured: boolean;
};

export interface AIProvider {
  readonly name: OrchestratorProviderName;

  chat(request: AIRequest): Promise<AIResponse>;
  reasoning(request: AIRequest): Promise<AIResponse>;
  summarize(request: AIRequest): Promise<AIResponse>;
  health(): Promise<boolean>;
  metadata(): AIProviderMetadata;
}

export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderConfigurationError';
  }
}

export class ProviderRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderRequestError';
  }
}

export class ProviderNotImplementedError extends Error {
  constructor(provider: OrchestratorProviderName, method: string) {
    super(`Provider "${provider}" does not implement ${method} yet.`);
    this.name = 'ProviderNotImplementedError';
  }
}

/** Future orchestrator invoke options (fallback, voting, capability routing). */
export type OrchestratorInvokeOptions = {
  capability?: AICapability;
  allowFallback?: boolean;
  retryCount?: number;
};
