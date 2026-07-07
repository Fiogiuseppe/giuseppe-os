export type IdentityChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const STORAGE_KEY = 'giuseppe-os-identity-chat-v1';

export function readIdentityChatSession(): IdentityChatMessage[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry): entry is IdentityChatMessage =>
        typeof entry === 'object' &&
        entry !== null &&
        (entry.role === 'user' || entry.role === 'assistant') &&
        typeof entry.content === 'string' &&
        entry.content.trim().length > 0 &&
        typeof entry.id === 'string'
    );
  } catch {
    return [];
  }
}

export function writeIdentityChatSession(messages: IdentityChatMessage[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function clearIdentityChatSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export const IDENTITY_CHAT_WINDOW_NAME = 'giuseppe-os-identity-chat';

export function openIdentityChatWindow(): void {
  const width = 560;
  const height = 860;
  const left = Math.max(0, window.screenX + window.outerWidth - width - 24);
  const top = Math.max(0, window.screenY + 48);
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'noopener',
    'noreferrer',
    'resizable=yes',
    'scrollbars=yes'
  ].join(',');

  window.open('/chat', IDENTITY_CHAT_WINDOW_NAME, features);
}
