import {
  getAIProvider,
  invokeReasoning,
  invokeChat,
  resolveActiveProviderName
} from './orchestrator';
import type { AIRequest } from './types';
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider as LegacyCompletionProvider,
  AIProviderName
} from '../brain/providers/types';

function mapOrchestratorNameToLegacy(name: string): AIProviderName {
  if (name === 'ollama') {
    return 'local';
  }

  if (
    name === 'groq' ||
    name === 'gemini' ||
    name === 'openai' ||
    name === 'requesty' ||
    name === 'rule-based' ||
    name === 'mock'
  ) {
    return name;
  }

  return 'groq';
}

function toOrchestratorRequest(request: AICompletionRequest): AIRequest {
  return {
    system: request.system,
    messages: request.messages.map(message => ({
      role: message.role,
      content: message.content
    })),
    maxTokens: request.maxTokens,
    temperature: request.temperature,
    expectJson: request.expectJson
  };
}

/**
 * Adapts the orchestrator provider to the legacy `complete()` interface
 * used by existing Giuseppe OS pipelines (brain, briefing, content, etc.).
 */
export function createCompletionProvider(): LegacyCompletionProvider {
  const orchestrator = getAIProvider();
  const legacyName = mapOrchestratorNameToLegacy(orchestrator.name);

  return {
    name: legacyName,
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      const aiRequest = toOrchestratorRequest(request);
      const response = request.expectJson
        ? await invokeReasoning(aiRequest)
        : await invokeChat(aiRequest);

      return {
        content: response.content,
        model: response.model
      };
    }
  };
}

/** @deprecated Use getAIProvider() from lib/ai/orchestrator instead. */
export function createGroqCompletionProvider(): LegacyCompletionProvider {
  return createCompletionProvider();
}

export function getActiveProviderLegacyName(): AIProviderName {
  return mapOrchestratorNameToLegacy(resolveActiveProviderName());
}
