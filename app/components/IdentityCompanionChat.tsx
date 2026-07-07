'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import {
  clearIdentityChatSession,
  readIdentityChatSession,
  type IdentityChatMessage,
  writeIdentityChatSession
} from '../../lib/chat/session-storage';
import styles from '../chat/chat.module.css';

type CompanionStatus = {
  configured: boolean;
  knowledgeCount: number;
};

export function IdentityCompanionChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<IdentityChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<CompanionStatus | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(readIdentityChatSession());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeIdentityChatSession(messages);
  }, [messages, hydrated]);

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
    if (!message || isSending || status?.configured === false) {
      return;
    }

    const userMessage: IdentityChatMessage = {
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

  function handleClearHistory() {
    clearIdentityChatSession();
    setMessages([]);
    setError(null);
  }

  const statusLabel = status
    ? status.configured
      ? t('memory.companion.ready')
      : t('memory.companion.offline')
    : t('memory.companion.checking');

  return (
    <div className={styles.shell} data-testid="identity-companion-chat">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>{t('memory.companion.label')}</p>
          <h1 className={styles.title}>{t('memory.companion.windowTitle')}</h1>
          <p className={styles.subtitle}>{t('memory.companion.lead')}</p>
        </div>
        {messages.length > 0 ? (
          <button type="button" className={styles.clearButton} onClick={handleClearHistory}>
            {t('memory.companion.clearHistory')}
          </button>
        ) : null}
      </header>

      <p className={styles.status} data-testid="memory-companion-status">
        {statusLabel}
        {status && status.knowledgeCount > 0
          ? ` · ${status.knowledgeCount} ${t('memory.companion.evidenceItems')}`
          : status
            ? ` · ${t('memory.companion.noEvidence')}`
            : ''}
      </p>

      <div ref={transcriptRef} className={styles.transcript}>
        {!hydrated ? (
          <p className={styles.empty}>{t('memory.companion.checking')}</p>
        ) : messages.length === 0 ? (
          <p className={styles.empty}>{t('memory.companion.emptyState')}</p>
        ) : (
          messages.map(entry => (
            <article
              key={entry.id}
              className={entry.role === 'user' ? styles.userBubble : styles.assistantBubble}
            >
              <p className={styles.role}>
                {entry.role === 'user' ? t('memory.companion.you') : t('memory.companion.os')}
              </p>
              <p className={styles.content}>{entry.content}</p>
            </article>
          ))
        )}
        {isSending ? <p className={styles.pending}>{t('memory.companion.thinking')}</p> : null}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          id="identity-chat-input"
          className={styles.input}
          data-testid="memory-companion-input"
          rows={3}
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder={t('memory.companion.placeholder')}
          disabled={isSending || status?.configured === false}
          aria-label={t('memory.companion.placeholder')}
        />
        <button
          type="submit"
          className={styles.sendButton}
          data-testid="memory-companion-send"
          disabled={isSending || !input.trim() || status?.configured === false}
        >
          {isSending ? t('memory.companion.thinking') : t('memory.companion.send')}
        </button>
      </form>
    </div>
  );
}
