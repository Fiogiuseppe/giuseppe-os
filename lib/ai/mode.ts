export type AIMode = 'mock' | 'live';

export function hasAnthropicApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function resolveAIMode(): AIMode {
  const configured = process.env.AI_MODE?.trim().toLowerCase();
  if (configured === 'mock') {
    return 'mock';
  }

  if (configured === 'live' && hasAnthropicApiKey()) {
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
