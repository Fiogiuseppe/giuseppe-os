import { createRuleBasedProvider } from './ruleBased';
import type { AICompletionRequest, AICompletionResponse, AIProvider } from './types';

const MOCK_MODEL = 'giuseppe-mock-v1';

export function createMockProvider(): AIProvider {
  const ruleBased = createRuleBasedProvider();

  return {
    name: 'mock',
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      const response = await ruleBased.complete(request);
      return {
        content: response.content,
        model: MOCK_MODEL
      };
    }
  };
}
