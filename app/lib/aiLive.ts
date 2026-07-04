export const AI_LIVE_STORAGE_KEY = 'giuseppe-ai-live';

export function readAiLivePreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(AI_LIVE_STORAGE_KEY) === 'on';
}

export function writeAiLivePreference(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AI_LIVE_STORAGE_KEY, enabled ? 'on' : 'off');
}

export function buildAiLiveHeaders(): Record<string, string> {
  return {
    'X-Giuseppe-AI-Live': readAiLivePreference() ? 'on' : 'off'
  };
}
