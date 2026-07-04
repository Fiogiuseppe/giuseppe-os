import type { AIProvider, AIProviderMetadata, AIRequest, AIResponse } from '../types';
import { ProviderNotImplementedError } from '../types';

function notImplemented(method: string): Promise<AIResponse> {
  return Promise.reject(new ProviderNotImplementedError('openai', method));
}

export function createOpenAIProvider(): AIProvider {
  return {
    name: 'openai',
    chat: () => notImplemented('chat'),
    reasoning: () => notImplemented('reasoning'),
    summarize: () => notImplemented('summarize'),
    async health() {
      return false;
    },
    metadata(): AIProviderMetadata {
      return {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        configured: false
      };
    }
  };
}
