import { readGroqApiKey } from '../../ai/credentials';
import type { AICompletionRequest, AICompletionResponse, AIProvider } from './types';
import { ProviderConfigurationError, ProviderRequestError } from './types';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = process.env.BRAIN_GROQ_MODEL ?? 'llama-3.3-70b-versatile';

export function createGroqProvider(): AIProvider {
  const apiKey = readGroqApiKey();

  return {
    name: 'groq',
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      if (!apiKey) {
        throw new ProviderConfigurationError(
          'GROQ_API_KEY is required for the Groq provider.'
        );
      }

      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
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
        throw new ProviderRequestError(`Groq provider failed (${response.status}): ${errorBody}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
      };

      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new ProviderRequestError('Groq provider returned an empty response.');
      }

      return {
        content,
        model: payload.model ?? DEFAULT_MODEL
      };
    }
  };
}
