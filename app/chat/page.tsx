'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AppTopbar } from '../components/AppTopbar';
import styles from './chat.module.css';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ChatServiceInfo = {
  provider: string;
  model: string;
  configured: boolean;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<ChatServiceInfo | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('chat-route');
    return () => document.documentElement.classList.remove('chat-route');
  }, []);

  useEffect(() => {
    async function loadServiceInfo() {
      const response = await fetch('/api/chat');
      if (!response.ok) {
        return;
      }

      const body = (await response.json()) as ChatServiceInfo;
      setServiceInfo(body);
    }

    void loadServiceInfo();
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

    setMessages(current => [...current, userMessage]);
    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(entry => ({
            role: entry.role,
            content: entry.content
          }))
        })
      });

      const body = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Chat request failed.');
      }

      if (!body.reply?.trim()) {
        throw new Error('Giuseppe OS returned an empty reply.');
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
      setError(submitError instanceof Error ? submitError.message : 'Chat request failed.');
    } finally {
      setIsSending(false);
    }
  }

  const subtitle = serviceInfo
    ? serviceInfo.configured
      ? serviceInfo.provider === 'groq'
        ? `Giuseppe OS via Groq · ${serviceInfo.model}`
        : serviceInfo.provider === 'gemini'
          ? `Giuseppe OS via Gemini · ${serviceInfo.model}`
          : `Giuseppe OS via Requesty · ${serviceInfo.model}`
      : `Local dev fallback · ${serviceInfo.provider} · ${serviceInfo.model}`
    : 'Giuseppe OS chat';

  return (
    <div className="app app-topnav chat-app">
      <AppTopbar mode="link" />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Chi sono</h1>
          <p className={styles.subtitle}>
            Conversazione identità — ancorata a Knowledge e costituzione. {subtitle}
          </p>
        </header>

        <div ref={transcriptRef} className={styles.transcript} aria-live="polite">
          {messages.length === 0 ? (
            <p className={styles.empty}>
              Parla con Giuseppe OS per restare coerente con chi sei — carriera, posizionamento, energia.
            </p>
          ) : (
            messages.map(entry => (
              <article
                key={entry.id}
                className={entry.role === 'user' ? styles.userBubble : styles.assistantBubble}
              >
                <p className={styles.role}>{entry.role === 'user' ? 'You' : 'Giuseppe OS'}</p>
                <p className={styles.content}>{entry.content}</p>
              </article>
            ))
          )}
          {isSending ? <p className={styles.pending}>Thinking…</p> : null}
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="chat-input">
            Message
          </label>
          <textarea
            id="chat-input"
            className={styles.input}
            rows={3}
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Ask Giuseppe OS something…"
            disabled={isSending}
          />
          <button type="submit" className={styles.sendButton} disabled={isSending || !input.trim()}>
            {isSending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
}
