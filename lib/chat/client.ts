import {
  hasGeminiApiKey,
  hasGroqApiKey,
  hasRequestyApiKey,
  isDevelopmentEnvironment,
  resolveConfiguredAiProvider
} from '../ai/mode';
import { createGeminiProvider } from '../brain/providers/gemini';
import { createGroqProvider } from '../brain/providers/groq';
import { createRequestyProvider } from '../brain/providers/requesty';
import type { AIProviderName } from '../brain/providers/types';
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

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.BRAIN_GROQ_MODEL ?? 'llama-3.3-70b-versatile';
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

function createLiveProvider(name: AIProviderName) {
  switch (name) {
    case 'groq':
      return createGroqProvider();
    case 'gemini':
      return createGeminiProvider();
    case 'requesty':
      return createRequestyProvider();
    default:
      return createGroqProvider();
  }
}

async function chatWithConfiguredProvider(
  providerName: 'groq' | 'gemini' | 'requesty',
  messages: ChatMessage[],
  system: string
): Promise<ChatResult> {
  try {
    const provider = createLiveProvider(providerName);
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
    const labels = { groq: 'Groq', gemini: 'Gemini', requesty: 'Requesty' };
    mapProviderError(error, labels[providerName]);
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

  if (configured === 'groq' && hasGroqApiKey()) {
    return 'groq';
  }

  if (configured === 'gemini' && hasGeminiApiKey()) {
    return 'gemini';
  }

  if (configured === 'requesty' && hasRequestyApiKey()) {
    return 'requesty';
  }

  return null;
}

export async function chatWithGiuseppe(messages: ChatMessage[]): Promise<ChatResult> {
  const system = buildChatSystemPrompt();
  const provider = resolveChatProvider();

  if (provider === 'groq' || provider === 'gemini' || provider === 'requesty') {
    return chatWithConfiguredProvider(provider, messages, system);
  }

  if (isDevelopmentEnvironment()) {
    return chatWithOllamaFallback(messages, system);
  }

  throw new ChatConfigurationError(
    'No online AI provider is configured. Add GROQ_API_KEY on the server.'
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

  if (provider === 'groq') {
    return {
      provider: 'groq',
      model: GROQ_MODEL,
      endpoint: GROQ_ENDPOINT,
      configured: true,
      fallback: null
    };
  }

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
    provider: 'groq',
    model: GROQ_MODEL,
    endpoint: GROQ_ENDPOINT,
    configured: false,
    fallback: null
  };
}
