import type { AIProvider } from '../brain/providers/types';
import { getAICallMeta } from './callContext';
import { getDailyUsage, recordAiUsage, formatCostLogLine } from './costEstimate';
import { estimateInputTokens, estimateOutputTokens, logLiveAICall } from './logging';

export function wrapProviderWithLogging(provider: AIProvider, route: string): AIProvider {
  return {
    name: provider.name,
    async complete(request) {
      const response = await provider.complete(request);
      const meta = getAICallMeta();
      const estimatedInputTokens = estimateInputTokens(
        request.system,
        request.messages.map(message => ({ content: message.content }))
      );
      const estimatedOutputTokens = estimateOutputTokens(response.content);

      logLiveAICall({
        route,
        page: meta?.page,
        reason: meta?.reason,
        provider: provider.name,
        model: response.model,
        estimatedInputTokens,
        estimatedOutputTokens
      });

      const usageRecord = recordAiUsage({
        provider: provider.name,
        model: response.model,
        route,
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens
      });
      const daily = getDailyUsage();
      console.info(`[ai-cost] ${formatCostLogLine(usageRecord, daily)}`);

      return response;
    }
  };
}
