import { readGroqApiKey } from '../credentials';
import { JSON_CONTRACT_TEMPERATURE } from '../jsonCompletion';
import type { AIProvider, AIProviderMetadata, AIRequest, AIResponse } from '../types';
import { ProviderConfigurationError, ProviderRequestError } from '../types';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = process.env.BRAIN_GROQ_MODEL ?? 'llama-3.3-70b-versatile';

const CHAT_TEMPERATURE = 0.4;
const SUMMARIZE_TEMPERATURE = 0.3;

async function executeGroqCompletion(
  request: AIRequest,
  mode: 'chat' | 'reasoning' | 'summarize'
): Promise<AIResponse> {
  const apiKey = readGroqApiKey();
  if (!apiKey) {
    throw new ProviderConfigurationError('GROQ_API_KEY is required for the Groq provider.');
  }

  const temperature =
    request.temperature ??
    (mode === 'reasoning'
      ? JSON_CONTRACT_TEMPERATURE
      : mode === 'summarize'
        ? SUMMARIZE_TEMPERATURE
        : CHAT_TEMPERATURE);

  const body: Record<string, unknown> = {
    model: DEFAULT_MODEL,
    temperature,
    max_tokens: request.maxTokens ?? 1200,
    messages: [{ role: 'system', content: request.system }, ...request.messages]
  };

  if (request.expectJson || mode === 'reasoning') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
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
    model: payload.model ?? DEFAULT_MODEL,
    provider: 'groq'
  };
}

export function createGroqProvider(): AIProvider {
  return {
    name: 'groq',

    chat(request: AIRequest) {
      return executeGroqCompletion({ ...request, expectJson: request.expectJson ?? false }, 'chat');
    },

    reasoning(request: AIRequest) {
      return executeGroqCompletion({ ...request, expectJson: true }, 'reasoning');
    },

    summarize(request: AIRequest) {
      return executeGroqCompletion(request, 'summarize');
    },

    async health() {
      return Boolean(readGroqApiKey());
    },

    metadata(): AIProviderMetadata {
      return {
        endpoint: `${GROQ_BASE_URL}/chat/completions`,
        defaultModel: DEFAULT_MODEL,
        configured: Boolean(readGroqApiKey())
      };
    }
  };
}
