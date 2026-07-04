import type { AIProvider, OrchestratorProviderName } from '../types';
import { createClaudeProvider } from './claude';
import { createGeminiProvider } from './gemini';
import { createGroqProvider } from './groq';
import { createOllamaProvider } from './ollama';
import { createOpenAIProvider } from './openai';

export type ProviderFactory = () => AIProvider;

export const PROVIDER_REGISTRY: Record<OrchestratorProviderName, ProviderFactory> = {
  groq: createGroqProvider,
  gemini: createGeminiProvider,
  claude: createClaudeProvider,
  openai: createOpenAIProvider,
  ollama: createOllamaProvider
};

export function createProviderByName(name: OrchestratorProviderName): AIProvider {
  const factory = PROVIDER_REGISTRY[name];
  return factory();
}

export { createGroqProvider, createGeminiProvider, createClaudeProvider, createOpenAIProvider, createOllamaProvider };
