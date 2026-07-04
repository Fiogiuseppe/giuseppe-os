import fs from 'node:fs';
import path from 'node:path';

const IDENTITY_PATH = path.join(process.cwd(), 'brain', 'GIUSEPPE_OS_IDENTITY.md');

function loadSystemPrompt(): string {
  return fs.readFileSync(IDENTITY_PATH, 'utf8').trim();
}

const SYSTEM_PROMPT = loadSystemPrompt();

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen3:8b';

export type OllamaChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export class OllamaUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaUnavailableError';
  }
}

export class OllamaChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OllamaChatError';
  }
}

function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const cause = error.cause as NodeJS.ErrnoException | undefined;
  return (
    error.message.includes('fetch failed') ||
    cause?.code === 'ECONNREFUSED' ||
    cause?.code === 'ENOTFOUND' ||
    cause?.code === 'ECONNRESET'
  );
}

export async function chatWithOllama(messages: OllamaChatMessage[]): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        stream: false
      })
    });
  } catch (error) {
    if (isConnectionError(error)) {
      throw new OllamaUnavailableError(
        'Ollama is not running. Start it locally with `ollama serve`, then pull the model with `ollama pull qwen3:8b`.'
      );
    }

    throw new OllamaChatError(error instanceof Error ? error.message : 'Failed to reach Ollama.');
  }

  if (!response.ok) {
    const errorBody = await response.text();

    if (response.status === 404 && errorBody.includes('model')) {
      throw new OllamaUnavailableError(
        `Model "${OLLAMA_MODEL}" is not available. Pull it with \`ollama pull ${OLLAMA_MODEL}\`.`
      );
    }

    throw new OllamaChatError(`Ollama request failed (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as {
    message?: { content?: string };
  };

  const reply = payload.message?.content?.trim();
  if (!reply) {
    throw new OllamaChatError('Ollama returned an empty response.');
  }

  return reply;
}

export function getOllamaConfig() {
  return {
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL
  };
}
