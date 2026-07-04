import type { AICompletionRequest, AICompletionResponse, AIProvider } from './types';
import { ProviderConfigurationError, ProviderRequestError } from './types';

import { readRequestyApiKey } from '../../ai/credentials';

const REQUESTY_BASE_URL = 'https://router.requesty.ai/v1';
const DEFAULT_MODEL = process.env.BRAIN_AI_MODEL ?? 'openai/gpt-5-mini';

export function createRequestyProvider(): AIProvider {
  const apiKey = readRequestyApiKey();

  return {
    name: 'requesty',
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      if (!apiKey) {
        throw new ProviderConfigurationError(
          'REQUESTY_API_KEY is required for the Requesty provider.'
        );
      }

      const response = await fetch(`${REQUESTY_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: request.temperature ?? 0.4,
          max_tokens: request.maxTokens ?? 1200,
          messages: [
            { role: 'system', content: request.system },
            ...request.messages
          ]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderRequestError(
          `Requesty provider failed (${response.status}): ${errorBody}`
        );
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
      };

      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new ProviderRequestError('Requesty provider returned an empty response.');
      }

      return {
        content,
        model: payload.model ?? DEFAULT_MODEL
      };
    }
  };
}
