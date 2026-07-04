import type { ContextPacket } from '../types';

export type AIProviderName = 'groq' | 'requesty' | 'openai' | 'gemini' | 'local' | 'rule-based' | 'mock';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  system: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  context?: ContextPacket;
}

export interface AICompletionResponse {
  content: string;
  model: string;
}

export interface AIProvider {
  readonly name: AIProviderName;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
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
