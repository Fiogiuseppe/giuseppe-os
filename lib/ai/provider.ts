import {
  hasGeminiApiKey,
  hasGroqApiKey,
  hasRequestyApiKey,
  isAIMockMode,
  resolveConfiguredAiProvider
} from './mode';
import { wrapProviderWithLogging } from './loggedProvider';
import { createGroqProvider } from '../brain/providers/groq';
import { createGeminiProvider } from '../brain/providers/gemini';
import { createRequestyProvider } from '../brain/providers/requesty';
import { createOpenAIProvider } from '../brain/providers/openai';
import { createRuleBasedProvider } from '../brain/providers/ruleBased';
import {
  ProviderConfigurationError,
  ProviderRequestError,
  type AICompletionRequest,
  type AICompletionResponse,
  type AIProvider,
  type AIProviderName
} from '../brain/providers/types';

export type ProviderCompletionResult = AICompletionResponse & {
  provider: AIProviderName;
};

function providerAvailable(name: AIProviderName): boolean {
  switch (name) {
    case 'groq':
      return hasGroqApiKey();
    case 'gemini':
      return hasGeminiApiKey();
    case 'requesty':
      return hasRequestyApiKey();
    case 'openai':
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    case 'local':
    case 'rule-based':
      return true;
    default:
      return false;
  }
}

function createRawProvider(name: AIProviderName): AIProvider | null {
  if (!providerAvailable(name)) {
    return null;
  }

  switch (name) {
    case 'groq':
      return createGroqProvider();
    case 'gemini':
      return createGeminiProvider();
    case 'requesty':
      return createRequestyProvider();
    case 'openai':
      return createOpenAIProvider();
    case 'rule-based':
      return createRuleBasedProvider();
    default:
      return null;
  }
}

const FALLBACK_ORDER: AIProviderName[] = ['groq', 'gemini', 'requesty', 'openai'];

export function buildProviderChain(): AIProvider[] {
  if (isAIMockMode()) {
    return [createRuleBasedProvider()];
  }

  const preferred = resolveConfiguredAiProvider();
  const chain: AIProvider[] = [];
  const seen = new Set<AIProviderName>();

  const add = (name: AIProviderName) => {
    if (seen.has(name)) {
      return;
    }

    const provider = createRawProvider(name);
    if (!provider) {
      return;
    }

    seen.add(name);
    chain.push(provider);
  };

  if (preferred !== 'local') {
    add(preferred);
  }

  for (const name of FALLBACK_ORDER) {
    add(name);
  }

  return chain.length ? chain : [createRuleBasedProvider()];
}

export async function completeWithProviderChain(
  request: AICompletionRequest,
  meta?: { route?: string; page?: string; reason?: string }
): Promise<ProviderCompletionResult> {
  const chain = buildProviderChain();
  const route = meta?.route ?? 'ai';
  let lastError: unknown;

  for (const provider of chain) {
    try {
      const wrapped =
        provider.name === 'rule-based'
          ? provider
          : wrapProviderWithLogging(provider, route);
      const response = await wrapped.complete(request);
      return { ...response, provider: provider.name };
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof ProviderConfigurationError || error instanceof ProviderRequestError;
      if (!retryable) {
        throw error;
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new ProviderRequestError('All AI providers failed.');
}
