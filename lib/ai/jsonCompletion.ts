import type { AICompletionRequest, AICompletionResponse, AIProvider } from '../brain/providers/types';

export const JSON_CONTRACT_TEMPERATURE = 0.25;
export const CREATIVE_CONTENT_TEMPERATURE = 0.55;

export const JSON_REPAIR_USER_MESSAGE =
  'Your last response was not valid JSON. Return ONLY the JSON object, no markdown fences, no preamble, no explanation.';

export class JsonContractError extends Error {
  readonly rawContent?: string;

  constructor(message: string, rawContent?: string) {
    super(message);
    this.name = 'JsonContractError';
    this.rawContent = rawContent;
  }
}

export function stripJsonCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

export function parseJsonContract(content: string): unknown {
  const cleaned = stripJsonCodeFence(content);
  return JSON.parse(cleaned);
}

export function buildJsonContractRequest(request: AICompletionRequest): AICompletionRequest {
  return {
    ...request,
    expectJson: true,
    temperature: request.temperature ?? JSON_CONTRACT_TEMPERATURE
  };
}

export async function completeWithJsonContract(
  provider: AIProvider,
  request: AICompletionRequest
): Promise<AICompletionResponse & { parsed: unknown }> {
  const jsonRequest = buildJsonContractRequest(request);
  let lastContent = '';

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const messages =
      attempt === 0
        ? jsonRequest.messages
        : [
            ...jsonRequest.messages,
            { role: 'assistant' as const, content: lastContent },
            { role: 'user' as const, content: JSON_REPAIR_USER_MESSAGE }
          ];

    const response = await provider.complete({ ...jsonRequest, messages });
    lastContent = response.content;

    try {
      const parsed = parseJsonContract(response.content);
      return { ...response, parsed };
    } catch {
      if (attempt === 1) {
        throw new JsonContractError(
          'AI response was not valid JSON after one repair retry.',
          lastContent
        );
      }
    }
  }

  throw new JsonContractError('AI response was not valid JSON.', lastContent);
}
