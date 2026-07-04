import { readGeminiApiKey, readGroqApiKey, readRequestyApiKey } from './credentials';

export type AIMode = 'mock' | 'live';

export type ConfiguredAiProvider =
  | 'groq'
  | 'gemini'
  | 'claude'
  | 'openai'
  | 'ollama'
  | 'requesty'
  | 'local'
  | 'rule-based';

export function hasRequestyApiKey(): boolean {
  return Boolean(readRequestyApiKey());
}

export function hasGeminiApiKey(): boolean {
  return Boolean(readGeminiApiKey());
}

export function hasGroqApiKey(): boolean {
  return Boolean(readGroqApiKey());
}

export function hasLiveAiCredentials(): boolean {
  return hasGroqApiKey() || hasRequestyApiKey() || hasGeminiApiKey();
}

export function resolveConfiguredAiProvider(): ConfiguredAiProvider {
  const configured =
    process.env.AI_PROVIDER?.trim().toLowerCase() ??
    process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase();

  if (
    configured === 'groq' ||
    configured === 'gemini' ||
    configured === 'claude' ||
    configured === 'openai' ||
    configured === 'ollama' ||
    configured === 'requesty' ||
    configured === 'local' ||
    configured === 'rule-based'
  ) {
    return configured;
  }

  return 'groq';
}

export function resolveAIMode(): AIMode {
  if (process.env.AI_MODE?.trim().toLowerCase() === 'mock') {
    return 'mock';
  }

  return hasLiveAiCredentials() ? 'live' : 'mock';
}

export function isAIMockMode(): boolean {
  return resolveAIMode() === 'mock';
}

export function isAILiveMode(): boolean {
  return resolveAIMode() === 'live';
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function shouldShowDevAiControls(): boolean {
  return isDevelopmentEnvironment();
}
