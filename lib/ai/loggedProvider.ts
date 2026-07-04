import type { AIProvider } from '../brain/providers/types';
import { estimateInputTokens, estimateOutputTokens, logLiveAICall } from './logging';

export function wrapProviderWithLogging(provider: AIProvider, route: string): AIProvider {
  return {
    name: provider.name,
    async complete(request) {
      const response = await provider.complete(request);

      logLiveAICall({
        route,
        provider: provider.name,
        model: response.model,
        estimatedInputTokens: estimateInputTokens(
          request.system,
          request.messages.map(message => ({ content: message.content }))
        ),
        estimatedOutputTokens: estimateOutputTokens(response.content)
      });

      return response;
    }
  };
}
