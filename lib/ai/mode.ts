export type AIMode = 'mock' | 'live';

export function resolveAIMode(): AIMode {
  const configured = process.env.AI_MODE?.trim().toLowerCase();

  if (configured === 'live' || configured === 'mock') {
    return configured;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'mock';
  }

  return 'live';
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
