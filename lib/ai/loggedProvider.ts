import type { AIProvider } from '../brain/providers/types';
import { getAICallMeta } from './callContext';
import { estimateInputTokens, estimateOutputTokens, logLiveAICall } from './logging';

export function wrapProviderWithLogging(provider: AIProvider, route: string): AIProvider {
  return {
    name: provider.name,
    async complete(request) {
      const response = await provider.complete(request);
      const meta = getAICallMeta();

      logLiveAICall({
        route,
        page: meta?.page,
        reason: meta?.reason,
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
