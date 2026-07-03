import type { AIProvider } from './types';
import { ProviderConfigurationError } from './types';

export function createLocalProvider(): AIProvider {
  const endpoint = process.env.LOCAL_AI_ENDPOINT;

  if (!endpoint) {
    return {
      name: 'local',
      async complete() {
        throw new ProviderConfigurationError('LOCAL_AI_ENDPOINT is required before the local provider can be enabled.');
      }
    };
  }

  const model = process.env.BRAIN_LOCAL_MODEL ?? 'local-model';

  return {
    name: 'local',
    async complete(request) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          system: request.system,
          messages: request.messages,
          max_tokens: request.maxTokens ?? 1200,
          temperature: request.temperature ?? 0.4
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderConfigurationError(`Local provider failed (${response.status}): ${errorBody}`);
      }

      const payload = (await response.json()) as {
        content?: string;
        message?: { content?: string };
        model?: string;
      };

      const content = payload.content ?? payload.message?.content;
      if (!content?.trim()) {
        throw new ProviderConfigurationError('Local provider returned an empty response.');
      }

      return {
        content: content.trim(),
        model: payload.model ?? model
      };
    }
  };
}
