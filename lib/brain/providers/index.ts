import { isAIMockMode, resolveConfiguredAiProvider } from '../../ai/mode';
import { wrapProviderWithLogging } from '../../ai/loggedProvider';
import type { AIProvider, AIProviderName } from './types';
import { createGroqProvider } from './groq';
import { createRequestyProvider } from './requesty';
import { createOpenAIProvider } from './openai';
import { createGeminiProvider } from './gemini';
import { createLocalProvider } from './local';
import { createRuleBasedProvider } from './ruleBased';
import { createMockProvider } from './mock';

function resolveProviderName(): AIProviderName {
  return resolveConfiguredAiProvider();
}

function resolveLiveProvider(name: AIProviderName): AIProvider {
  switch (name) {
    case 'openai':
      return wrapProviderWithLogging(createOpenAIProvider(), 'brain');
    case 'gemini':
      return wrapProviderWithLogging(createGeminiProvider(), 'brain');
    case 'local':
      return wrapProviderWithLogging(createLocalProvider(), 'brain');
    case 'rule-based':
      return createRuleBasedProvider();
    case 'requesty':
      return wrapProviderWithLogging(createRequestyProvider(), 'brain');
    case 'groq':
    default:
      return wrapProviderWithLogging(createGroqProvider(), 'brain');
  }
}

export function resolveAIProvider(): AIProvider {
  if (isAIMockMode()) {
    return createMockProvider();
  }

  return resolveLiveProvider(resolveProviderName());
}

export { createRuleBasedProvider, createMockProvider, createGroqProvider, createRequestyProvider, createGeminiProvider };
