import type { AIProvider, AIProviderMetadata, AIRequest, AIResponse } from '../types';
import { ProviderNotImplementedError } from '../types';

function notImplemented(method: string): Promise<AIResponse> {
  return Promise.reject(new ProviderNotImplementedError('claude', method));
}

export function createClaudeProvider(): AIProvider {
  return {
    name: 'claude',
    chat: () => notImplemented('chat'),
    reasoning: () => notImplemented('reasoning'),
    summarize: () => notImplemented('summarize'),
    async health() {
      return false;
    },
    metadata(): AIProviderMetadata {
      return {
        endpoint: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-sonnet-4-20250514',
        configured: false
      };
    }
  };
}
