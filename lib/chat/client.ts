import {
  hasGeminiApiKey,
  hasLiveAiCredentials,
  hasRequestyApiKey,
  isDevelopmentEnvironment,
  resolveConfiguredAiProvider
} from '../ai/mode';
import { createGeminiProvider } from '../brain/providers/gemini';
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
const GEMINI_MODEL = process.env.BRAIN_GEMINI_MODEL ?? 'gemini-2.0-flash';

function mapProviderError(error: unknown, providerLabel: string): never {
  if (error instanceof ProviderConfigurationError) {
    throw new ChatConfigurationError(
      `${providerLabel} is not configured. Add the required API key to the server environment.`
    );
  }

  if (error instanceof ProviderRequestError) {
    throw new ChatProviderError(error.message);
  }

  throw error;
}

async function chatWithConfiguredProvider(
  providerName: 'gemini' | 'requesty',
  messages: ChatMessage[],
  system: string
): Promise<ChatResult> {
  try {
    const provider = providerName === 'gemini' ? createGeminiProvider() : createRequestyProvider();
    const completion = await provider.complete({
      system,
      messages,
      maxTokens: 1200,
      temperature: 0.4
    });

    return {
      reply: completion.content,
      provider: providerName,
      model: completion.model
    };
  } catch (error) {
    mapProviderError(error, providerName === 'gemini' ? 'Gemini' : 'Requesty');
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

function resolveChatProvider(): ChatProviderName | null {
  const configured = resolveConfiguredAiProvider();

  if (configured === 'gemini' && hasGeminiApiKey()) {
    return 'gemini';
  }

  if (configured === 'requesty' && hasRequestyApiKey()) {
    return 'requesty';
  }

  if (hasGeminiApiKey()) {
    return 'gemini';
  }

  if (hasRequestyApiKey()) {
    return 'requesty';
  }

  return null;
}

export async function chatWithGiuseppe(messages: ChatMessage[]): Promise<ChatResult> {
  const system = buildChatSystemPrompt();
  const provider = resolveChatProvider();

  if (provider === 'gemini' || provider === 'requesty') {
    return chatWithConfiguredProvider(provider, messages, system);
  }

  if (isDevelopmentEnvironment()) {
    return chatWithOllamaFallback(messages, system);
  }

  throw new ChatConfigurationError(
    'No online AI provider is configured. Add GEMINI_API_KEY or REQUESTY_API_KEY on the server.'
  );
}

export function getChatServiceConfig(): {
  provider: ChatProviderName;
  model: string;
  endpoint: string;
  configured: boolean;
  fallback: string | null;
} {
  const provider = resolveChatProvider();

  if (provider === 'gemini') {
    return {
      provider: 'gemini',
      model: GEMINI_MODEL,
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      configured: true,
      fallback: null
    };
  }

  if (provider === 'requesty') {
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
    provider: 'gemini',
    model: GEMINI_MODEL,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    configured: false,
    fallback: null
  };
}
