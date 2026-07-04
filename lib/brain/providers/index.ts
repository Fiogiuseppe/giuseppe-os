import { isAIMockMode } from '../../ai/mode';
import { wrapProviderWithLogging } from '../../ai/loggedProvider';
import type { AIProvider, AIProviderName } from './types';
import { createRequestyProvider } from './requesty';
import { createOpenAIProvider } from './openai';
import { createGeminiProvider } from './gemini';
import { createLocalProvider } from './local';
import { createRuleBasedProvider } from './ruleBased';
import { createMockProvider } from './mock';

function resolveProviderName(): AIProviderName {
  const configured = process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase();

  if (
    configured === 'requesty' ||
    configured === 'openai' ||
    configured === 'gemini' ||
    configured === 'local' ||
    configured === 'rule-based'
  ) {
    return configured;
  }

  return 'requesty';
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
    default:
      return wrapProviderWithLogging(createRequestyProvider(), 'brain');
  }
}

export function resolveAIProvider(): AIProvider {
  if (isAIMockMode()) {
    return createMockProvider();
  }

  return resolveLiveProvider(resolveProviderName());
}

export { createRuleBasedProvider, createMockProvider, createRequestyProvider };
