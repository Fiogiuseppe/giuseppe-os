import type { AIProvider } from './types';
import { ProviderConfigurationError } from './types';

export function createOpenAIProvider(): AIProvider {
  if (!process.env.OPENAI_API_KEY) {
    return {
      name: 'openai',
      async complete() {
        throw new ProviderConfigurationError('OPENAI_API_KEY is required before the openai provider can be enabled.');
      }
    };
  }

  const model = process.env.BRAIN_OPENAI_MODEL ?? 'gpt-4.1';

  return {
    name: 'openai',
    async complete(request) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
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
        throw new ProviderConfigurationError(`OpenAI provider failed (${response.status}): ${errorBody}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        model?: string;
      };

      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new ProviderConfigurationError('OpenAI provider returned an empty response.');
      }

      return { content, model: payload.model ?? model };
    }
  };
}
