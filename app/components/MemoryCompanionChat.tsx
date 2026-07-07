'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function MemoryCompanionChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const node = transcriptRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isSending, expanded]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsSending(true);
    setExpanded(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(entry => ({
            role: entry.role,
            content: entry.content
          }))
        })
      });

      const body = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? t('memory.companion.error'));
      }

      if (!body.reply?.trim()) {
        throw new Error(t('memory.companion.empty'));
      }

      const reply = body.reply.trim();
      setMessages(current => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply
        }
      ]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('memory.companion.error'));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section
      className={`memory-companion${expanded ? ' memory-companion--open' : ''}`}
      data-testid="memory-companion"
      aria-label={t('memory.companion.label')}
    >
      {expanded ? (
        <div ref={transcriptRef} className="memory-companion-transcript" aria-live="polite">
          {messages.map(entry => (
            <article
              key={entry.id}
              className={
                entry.role === 'user'
                  ? 'memory-companion-bubble memory-companion-bubble--user'
                  : 'memory-companion-bubble memory-companion-bubble--assistant'
              }
            >
              <p className="memory-companion-role">
                {entry.role === 'user' ? t('memory.companion.you') : t('memory.companion.os')}
              </p>
              <p className="memory-companion-content">{entry.content}</p>
            </article>
          ))}
          {isSending ? <p className="memory-companion-pending">{t('memory.companion.thinking')}</p> : null}
        </div>
      ) : (
        <p className="memory-companion-lead">{t('memory.companion.lead')}</p>
      )}

      {error ? (
        <p className="memory-companion-error" role="alert">
          {error}
        </p>
      ) : null}

      <form className="memory-companion-form" onSubmit={handleSubmit}>
        <input
          className="memory-companion-input"
          data-testid="memory-companion-input"
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder={t('memory.companion.placeholder')}
          disabled={isSending}
          aria-label={t('memory.companion.placeholder')}
        />
        <button
          type="submit"
          className="memory-companion-submit"
          data-testid="memory-companion-send"
          disabled={isSending || !input.trim()}
          aria-label={isSending ? t('memory.companion.thinking') : t('memory.companion.send')}
        >
          <span aria-hidden="true">→</span>
        </button>
      </form>

      {messages.length > 0 ? (
        <button
          type="button"
          className="memory-companion-toggle"
          onClick={() => setExpanded(current => !current)}
        >
          {expanded ? t('memory.companion.collapse') : t('memory.companion.expand')}
        </button>
      ) : null}
    </section>
  );
}
