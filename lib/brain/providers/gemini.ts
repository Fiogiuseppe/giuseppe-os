import type { AIProvider } from './types';
import { ProviderConfigurationError, ProviderRequestError } from './types';

export function createGeminiProvider(): AIProvider {
  if (!process.env.GEMINI_API_KEY) {
    return {
      name: 'gemini',
      async complete() {
        throw new ProviderConfigurationError('GEMINI_API_KEY is required before the gemini provider can be enabled.');
      }
    };
  }

  const model = process.env.BRAIN_GEMINI_MODEL ?? 'gemini-2.0-flash';

  return {
    name: 'gemini',
    async complete(request) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: request.system }] },
            contents: request.messages.map(message => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: message.content }]
            })),
            generationConfig: {
              temperature: request.temperature ?? 0.4,
              maxOutputTokens: request.maxTokens ?? 1200
            }
          })
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new ProviderRequestError(`Gemini provider failed (${response.status}): ${errorBody}`);
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const content = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!content) {
        throw new ProviderRequestError('Gemini provider returned an empty response.');
      }

      return { content, model };
    }
  };
}
