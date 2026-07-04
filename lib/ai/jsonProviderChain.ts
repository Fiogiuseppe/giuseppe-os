import type { AICompletionRequest } from '../brain/providers/types';
import {
  ProviderConfigurationError,
  ProviderRequestError
} from '../brain/providers/types';
import { completeWithJsonContract } from './jsonCompletion';
import { buildProviderChain } from './provider';
import { wrapProviderWithLogging } from './loggedProvider';
import type { ProviderCompletionResult } from './provider';

export async function completeJsonWithProviderChain(
  request: AICompletionRequest,
  meta?: { route?: string; page?: string; reason?: string }
): Promise<ProviderCompletionResult & { parsed: unknown }> {
  const chain = buildProviderChain();
  const route = meta?.route ?? 'ai';
  let lastError: unknown;

  for (const provider of chain) {
    try {
      const wrapped =
        provider.name === 'rule-based'
          ? provider
          : wrapProviderWithLogging(provider, route);
      const response = await completeWithJsonContract(wrapped, request);
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

  throw new ProviderRequestError('All AI providers failed for JSON contract call.');
}
