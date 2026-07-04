export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatProviderName = 'groq' | 'requesty' | 'gemini' | 'ollama';

export class ChatConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatConfigurationError';
  }
}

export class ChatProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatProviderError';
  }
}

export type ChatResult = {
  reply: string;
  provider: ChatProviderName;
  model: string;
};
