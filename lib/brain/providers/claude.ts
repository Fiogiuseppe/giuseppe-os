import type { AICompletionRequest, AICompletionResponse, AIProvider } from './types';
import { ProviderConfigurationError, ProviderRequestError } from './types';

const DEFAULT_MODEL = process.env.BRAIN_AI_MODEL ?? 'claude-sonnet-4-6';

export function createClaudeProvider(): AIProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  return {
    name: 'claude',
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      if (!apiKey) {
        throw new ProviderConfigurationError(
          'ANTHROPIC_API_KEY is required for the Claude provider.'
        );
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: request.maxTokens ?? 1200,
          temperature: request.temperature ?? 0.4,
          system: request.system,
          messages: request.messages.map(message => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderRequestError(
          `Claude provider failed (${response.status}): ${errorBody}`
        );
      }

      const payload = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
        model?: string;
      };

      const text = payload.content
        ?.filter(block => block.type === 'text')
        .map(block => block.text ?? '')
        .join('\n')
        .trim();

      if (!text) {
        throw new ProviderRequestError('Claude provider returned an empty response.');
      }

      return {
        content: text,
        model: payload.model ?? DEFAULT_MODEL
      };
    }
  };
}
