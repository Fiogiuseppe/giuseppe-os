'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AppTopbar } from '../components/AppTopbar';
import styles from './chat.module.css';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('chat-route');
    return () => document.documentElement.classList.remove('chat-route');
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
        body: JSON.stringify({ message })
      });

      const body = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? 'Chat request failed.');
      }

      if (!body.reply?.trim()) {
        throw new Error('Ollama returned an empty reply.');
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

  return (
    <div className="app app-topnav chat-app">
      <AppTopbar mode="link" />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Local chat</h1>
          <p className={styles.subtitle}>Giuseppe OS via Ollama · qwen3:8b</p>
        </header>

        <div ref={transcriptRef} className={styles.transcript} aria-live="polite">
          {messages.length === 0 ? (
            <p className={styles.empty}>Send a message to test the local Ollama connection.</p>
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
