'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type CompanionStatus = {
  configured: boolean;
  knowledgeCount: number;
};

export function MemoryCompanionChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<CompanionStatus | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const [chatResponse, knowledgeResponse] = await Promise.all([
        fetch('/api/chat'),
        fetch('/api/knowledge')
      ]);

      if (cancelled) {
        return;
      }

      const chatBody = chatResponse.ok ? ((await chatResponse.json()) as { configured?: boolean }) : {};
      const knowledgeBody = knowledgeResponse.ok
        ? ((await knowledgeResponse.json()) as { items?: unknown[] })
        : {};

      setStatus({
        configured: chatBody.configured === true,
        knowledgeCount: Array.isArray(knowledgeBody.items) ? knowledgeBody.items.length : 0
      });
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = transcriptRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isSending]);

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

  const statusLabel = status
    ? status.configured
      ? t('memory.companion.ready')
      : t('memory.companion.offline')
    : t('memory.companion.checking');

  return (
    <section
      className="memory-companion"
      data-testid="memory-companion"
      aria-label={t('memory.companion.label')}
    >
      <p className="memory-companion-lead">{t('memory.companion.lead')}</p>

      <p className="memory-companion-status" data-testid="memory-companion-status">
        {statusLabel}
        {status && status.knowledgeCount > 0
          ? ` · ${status.knowledgeCount} ${t('memory.companion.evidenceItems')}`
          : status
            ? ` · ${t('memory.companion.noEvidence')}`
            : ''}
      </p>

      {messages.length > 0 ? (
        <div ref={transcriptRef} className="memory-companion-transcript">
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
      ) : null}

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
          disabled={isSending || status?.configured === false}
          aria-label={t('memory.companion.placeholder')}
        />
        <button
          type="submit"
          className="memory-companion-submit"
          data-testid="memory-companion-send"
          disabled={isSending || !input.trim() || status?.configured === false}
          aria-label={isSending ? t('memory.companion.thinking') : t('memory.companion.send')}
        >
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </section>
  );
}
