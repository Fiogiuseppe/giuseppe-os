import { getAIProvider, invokeChatWithDevFallback, resolveActiveProviderName } from '../ai/orchestrator';
import { ProviderConfigurationError, ProviderRequestError } from '../ai/types';
import { buildChatSystemPrompt } from './identity';
import {
  ChatConfigurationError,
  ChatProviderError,
  type ChatMessage,
  type ChatProviderName,
  type ChatResult
} from './types';

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

function toOrchestratorProviderName(name: string): ChatProviderName {
  if (name === 'groq' || name === 'gemini' || name === 'ollama' || name === 'openai' || name === 'claude') {
    return name;
  }

  return 'groq';
}

export async function chatWithGiuseppe(messages: ChatMessage[]): Promise<ChatResult> {
  const system = buildChatSystemPrompt();

  try {
    const response = await invokeChatWithDevFallback({
      system,
      messages,
      maxTokens: 1200,
      temperature: 0.4
    });

    return {
      reply: response.content,
      provider: toOrchestratorProviderName(response.provider),
      model: response.model
    };
  } catch (error) {
    mapProviderError(error, resolveActiveProviderName());
  }
}

export function getChatServiceConfig(): {
  provider: ChatProviderName;
  model: string;
  endpoint: string;
  configured: boolean;
  fallback: string | null;
} {
  const ai = getAIProvider();
  const meta = ai.metadata();
  const active = resolveActiveProviderName();

  return {
    provider: toOrchestratorProviderName(active),
    model: meta.defaultModel,
    endpoint: meta.endpoint,
    configured: meta.configured,
    fallback: meta.configured ? null : active === 'ollama' ? null : 'ollama-local-dev-only'
  };
}
