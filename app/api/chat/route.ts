import { chatWithGiuseppe, getChatServiceConfig } from '../../../lib/chat/client';
import { ChatConfigurationError, ChatProviderError } from '../../../lib/chat/types';
import type { ChatMessage } from '../../../lib/chat/types';

function parseMessages(body: Record<string, unknown>): ChatMessage[] | null {
  if (Array.isArray(body.messages)) {
    const messages = body.messages
      .filter(
        (entry): entry is ChatMessage =>
          typeof entry === 'object' &&
          entry !== null &&
          ((entry as ChatMessage).role === 'user' || (entry as ChatMessage).role === 'assistant') &&
          typeof (entry as ChatMessage).content === 'string' &&
          (entry as ChatMessage).content.trim().length > 0
      )
      .map(entry => ({
        role: entry.role,
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
  const config = getChatServiceConfig();

  return Response.json({
    status: 'ok',
    service: 'giuseppe-chat',
    provider: config.provider,
    model: config.model,
    endpoint: config.endpoint,
    configured: config.configured,
    fallback: config.fallback,
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

    const result = await chatWithGiuseppe(messages);
    return Response.json({ reply: result.reply });
  } catch (error) {
    if (error instanceof ChatConfigurationError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof ChatProviderError) {
      return Response.json({ error: error.message }, { status: 502 });
    }

    return Response.json({ error: 'Unexpected chat error.' }, { status: 500 });
  }
}
