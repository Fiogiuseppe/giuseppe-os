export type AIMode = 'mock' | 'live';

export function hasRequestyApiKey(): boolean {
  return Boolean(process.env.REQUESTY_API_KEY?.trim());
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function hasLiveAiCredentials(): boolean {
  return hasRequestyApiKey() || hasGeminiApiKey();
}

export function resolveConfiguredAiProvider(): 'requesty' | 'gemini' | 'openai' | 'local' | 'rule-based' {
  const configured = process.env.BRAIN_AI_PROVIDER?.trim().toLowerCase();

  if (
    configured === 'requesty' ||
    configured === 'gemini' ||
    configured === 'openai' ||
    configured === 'local' ||
    configured === 'rule-based'
  ) {
    return configured;
  }

  return 'gemini';
}

export function resolveAIMode(): AIMode {
  const configured = process.env.AI_MODE?.trim().toLowerCase();
  if (configured === 'mock') {
    return 'mock';
  }

  if (configured === 'live' && hasLiveAiCredentials()) {
    return 'live';
  }

  return 'mock';
}

export function isAIMockMode(): boolean {
  return resolveAIMode() === 'mock';
}

export function isAILiveMode(): boolean {
  return resolveAIMode() === 'live';
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function shouldShowDevAiControls(): boolean {
  return isDevelopmentEnvironment();
}
