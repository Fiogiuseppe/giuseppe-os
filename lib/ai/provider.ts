import { isAIMockMode } from './mode';
import { wrapProviderWithLogging } from './loggedProvider';
import { createCompletionProvider } from './completionAdapter';
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

/**
 * Builds the provider execution chain.
 * Today: single orchestrator-backed provider (+ rule-based in mock mode).
 * Future: fallback list, voting, cost routing — without changing callers.
 */
export function buildProviderChain(): AIProvider[] {
  if (isAIMockMode()) {
    return [createRuleBasedProvider()];
  }

  return [createCompletionProvider()];
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
