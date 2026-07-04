import { chatWithOllama, getOllamaConfig } from '../../ollama/chat';
import type { AIProvider, AIProviderMetadata, AIRequest, AIResponse } from '../types';
import { ProviderNotImplementedError } from '../types';

/**
 * Local Ollama provider — chat only for development.
 * TODO: reasoning, summarize, and production routing when AI_PROVIDER=ollama is fully supported.
 */
export function createOllamaProvider(): AIProvider {
  const config = getOllamaConfig();

  return {
    name: 'ollama',

    async chat(request: AIRequest) {
      const reply = await chatWithOllama(
        request.messages.filter(message => message.role !== 'system'),
        request.system
      );

      return {
        content: reply,
        model: config.model,
        provider: 'ollama'
      };
    },

    reasoning() {
      return Promise.reject(new ProviderNotImplementedError('ollama', 'reasoning'));
    },

    summarize() {
      return Promise.reject(new ProviderNotImplementedError('ollama', 'summarize'));
    },

    async health() {
      try {
        const response = await fetch(`${config.baseUrl}/api/tags`, { method: 'GET' });
        return response.ok;
      } catch {
        return false;
      }
    },

    metadata(): AIProviderMetadata {
      return {
        endpoint: `${config.baseUrl}/api/chat`,
        defaultModel: config.model,
        configured: false
      };
    }
  };
}
