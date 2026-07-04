import type {
  AIProvider as OrchestratorAIProvider,
  AIRequest,
  AIResponse,
  OrchestratorInvokeOptions,
  OrchestratorProviderName
} from './types';
import { createProviderByName, PROVIDER_REGISTRY } from './providers';
import { isDevelopmentEnvironment } from './mode';

const VALID_PROVIDERS = Object.keys(PROVIDER_REGISTRY) as OrchestratorProviderName[];

let cachedProvider: OrchestratorAIProvider | null = null;
let cachedProviderName: OrchestratorProviderName | null = null;

/**
 * Resolves the active provider from AI_PROVIDER (canonical).
 * BRAIN_AI_PROVIDER is accepted as a deprecated alias for backward compatibility.
 */
export function resolveActiveProviderName(): OrchestratorProviderName {
  const configured =
    process.env.AI_PROVIDER?.trim().toLowerCase() ??
    process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase();

  if (configured && VALID_PROVIDERS.includes(configured as OrchestratorProviderName)) {
    return configured as OrchestratorProviderName;
  }

  return 'groq';
}

/**
 * Returns the configured AI provider instance.
 * Application code must use this — never import a specific provider module.
 */
export function getAIProvider(options: OrchestratorInvokeOptions = {}): OrchestratorAIProvider {
  void options; // reserved for future capability routing / fallback / voting

  const name = resolveActiveProviderName();

  if (cachedProvider && cachedProviderName === name) {
    return cachedProvider;
  }

  cachedProvider = createProviderByName(name);
  cachedProviderName = name;
  return cachedProvider;
}

/** Clears cached provider — useful in tests when env changes. */
export function resetAIProviderCache(): void {
  cachedProvider = null;
  cachedProviderName = null;
}

/**
 * Future: map capabilities to provider selection strategies.
 * Not implemented — structure only.
 */
export function resolveProviderForCapability(
  capability: OrchestratorInvokeOptions['capability']
): OrchestratorProviderName {
  void capability;
  return resolveActiveProviderName();
}

export async function invokeChat(
  request: AIRequest,
  options: OrchestratorInvokeOptions = {}
): Promise<AIResponse> {
  const provider = getAIProvider(options);
  return provider.chat(request);
}

export async function invokeReasoning(
  request: AIRequest,
  options: OrchestratorInvokeOptions = {}
): Promise<AIResponse> {
  const provider = getAIProvider(options);
  return provider.reasoning(request);
}

export async function invokeSummarize(
  request: AIRequest,
  options: OrchestratorInvokeOptions = {}
): Promise<AIResponse> {
  const provider = getAIProvider(options);
  return provider.summarize(request);
}

/**
 * Resolves chat with dev-local fallback when the configured provider is unavailable.
 * Keeps today’s behaviour: Groq in production, Ollama in local dev when unconfigured.
 */
export async function invokeChatWithDevFallback(request: AIRequest): Promise<AIResponse> {
  const primary = getAIProvider();

  if (await primary.health()) {
    return primary.chat(request);
  }

  if (isDevelopmentEnvironment() && primary.name !== 'ollama') {
    const ollama = createProviderByName('ollama');
    if (await ollama.health()) {
      return ollama.chat(request);
    }
  }

  return primary.chat(request);
}
