import type { AIProvider, AIProviderMetadata, AIRequest, AIResponse } from '../types';
import { ProviderNotImplementedError } from '../types';

function notImplemented(method: string): Promise<AIResponse> {
  return Promise.reject(new ProviderNotImplementedError('gemini', method));
}

export function createGeminiProvider(): AIProvider {
  return {
    name: 'gemini',
    chat: () => notImplemented('chat'),
    reasoning: () => notImplemented('reasoning'),
    summarize: () => notImplemented('summarize'),
    async health() {
      return false;
    },
    metadata(): AIProviderMetadata {
      return {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        defaultModel: 'gemini-2.0-flash',
        configured: false
      };
    }
  };
}
