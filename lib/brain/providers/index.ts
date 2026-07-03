import type { AIProvider, AIProviderName } from './types';
import { createClaudeProvider } from './claude';
import { createOpenAIProvider } from './openai';
import { createGeminiProvider } from './gemini';
import { createLocalProvider } from './local';
import { createRuleBasedProvider } from './ruleBased';

function resolveProviderName(): AIProviderName {
  const configured = process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase();

  if (
    configured === 'claude' ||
    configured === 'openai' ||
    configured === 'gemini' ||
    configured === 'local' ||
    configured === 'rule-based'
  ) {
    return configured;
  }

  return 'claude';
}

export function resolveAIProvider(): AIProvider {
  const name = resolveProviderName();

  switch (name) {
    case 'openai':
      return createOpenAIProvider();
    case 'gemini':
      return createGeminiProvider();
    case 'local':
      return createLocalProvider();
    case 'rule-based':
      return createRuleBasedProvider();
    case 'claude':
    default:
      return createClaudeProvider();
  }
}
