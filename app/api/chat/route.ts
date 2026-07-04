import {
  chatWithOllama,
  getOllamaConfig,
  OllamaChatError,
  OllamaUnavailableError,
  type OllamaChatMessage
} from '../../../lib/ollama/chat';

function parseMessages(body: Record<string, unknown>): OllamaChatMessage[] | null {
  if (Array.isArray(body.messages)) {
    const messages = body.messages
      .filter(
        (entry): entry is OllamaChatMessage =>
          typeof entry === 'object' &&
          entry !== null &&
          (entry as OllamaChatMessage).role === 'user' &&
          typeof (entry as OllamaChatMessage).content === 'string' &&
          (entry as OllamaChatMessage).content.trim().length > 0
      )
      .map(entry => ({
        role: 'user' as const,
        content: entry.content.trim()
      }));

    return messages.length > 0 ? messages : null;
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return [{ role: 'user', content: body.message.trim() }];
  }

  return null;
}

export async function GET() {
  const config = getOllamaConfig();

  return Response.json({
    status: 'ok',
    service: 'giuseppe-chat',
    provider: 'ollama',
    model: config.model,
    endpoint: `${config.baseUrl}/api/chat`,
    stream: false
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const messages = parseMessages(body);

    if (!messages) {
      return Response.json({ error: 'A non-empty message is required.' }, { status: 400 });
    }

    const reply = await chatWithOllama(messages);
    return Response.json({ reply });
  } catch (error) {
    if (error instanceof OllamaUnavailableError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof OllamaChatError) {
      return Response.json({ error: error.message }, { status: 502 });
    }

    return Response.json({ error: 'Unexpected chat error.' }, { status: 500 });
  }
}
