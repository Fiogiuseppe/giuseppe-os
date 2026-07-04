import { hasRequestyApiKey, isDevelopmentEnvironment } from '../ai/mode';
import { createRequestyProvider } from '../brain/providers/requesty';
import { ProviderConfigurationError, ProviderRequestError } from '../brain/providers/types';
import { chatWithOllama, getOllamaConfig, OllamaChatError, OllamaUnavailableError } from '../ollama/chat';
import { buildChatSystemPrompt } from './identity';
import {
  ChatConfigurationError,
  ChatProviderError,
  type ChatMessage,
  type ChatProviderName,
  type ChatResult
} from './types';

const REQUESTY_ENDPOINT = 'https://router.requesty.ai/v1/chat/completions';
const REQUESTY_MODEL = process.env.BRAIN_AI_MODEL ?? 'openai/gpt-5-mini';

function mapRequestyError(error: unknown): never {
  if (error instanceof ProviderConfigurationError) {
    throw new ChatConfigurationError(
      'REQUESTY_API_KEY is not configured. Add it to the server environment to enable online chat.'
    );
  }

  if (error instanceof ProviderRequestError) {
    throw new ChatProviderError(
      error.message.startsWith('Requesty provider failed')
        ? error.message
        : `Requesty request failed: ${error.message}`
    );
  }

  throw error;
}

async function chatWithRequesty(messages: ChatMessage[], system: string): Promise<ChatResult> {
  try {
    const provider = createRequestyProvider();
    const completion = await provider.complete({
      system,
      messages,
      maxTokens: 1200,
      temperature: 0.4
    });

    return {
      reply: completion.content,
      provider: 'requesty',
      model: completion.model
    };
  } catch (error) {
    mapRequestyError(error);
  }
}

async function chatWithOllamaFallback(messages: ChatMessage[], system: string): Promise<ChatResult> {
  try {
    const reply = await chatWithOllama(messages, system);
    const config = getOllamaConfig();
    return {
      reply,
      provider: 'ollama',
      model: config.model
    };
  } catch (error) {
    if (error instanceof OllamaUnavailableError) {
      throw new ChatConfigurationError(error.message);
    }

    if (error instanceof OllamaChatError) {
      throw new ChatProviderError(error.message);
    }

    throw error;
  }
}

export async function chatWithGiuseppe(messages: ChatMessage[]): Promise<ChatResult> {
  const system = buildChatSystemPrompt();

  if (hasRequestyApiKey()) {
    return chatWithRequesty(messages, system);
  }

  if (isDevelopmentEnvironment()) {
    return chatWithOllamaFallback(messages, system);
  }

  throw new ChatConfigurationError(
    'REQUESTY_API_KEY is not configured on the server. Online chat requires Requesty in production.'
  );
}

export function getChatServiceConfig(): {
  provider: ChatProviderName;
  model: string;
  endpoint: string;
  configured: boolean;
  fallback: string | null;
} {
  if (hasRequestyApiKey()) {
    return {
      provider: 'requesty',
      model: REQUESTY_MODEL,
      endpoint: REQUESTY_ENDPOINT,
      configured: true,
      fallback: null
    };
  }

  if (isDevelopmentEnvironment()) {
    const ollama = getOllamaConfig();
    return {
      provider: 'ollama',
      model: ollama.model,
      endpoint: `${ollama.baseUrl}/api/chat`,
      configured: false,
      fallback: 'ollama-local-dev-only'
    };
  }

  return {
    provider: 'requesty',
    model: REQUESTY_MODEL,
    endpoint: REQUESTY_ENDPOINT,
    configured: false,
    fallback: null
  };
}
