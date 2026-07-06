'use client';

import { useCallback, useState } from 'react';
import type { BrainAnswerResponse } from '../answer/brain-answer.types';
import styles from './BrainDebugPage.module.css';

const PRESET_QUESTIONS = [
  'What does Giuseppe OS know about UREES?',
  'Tell me about Visceral Poems',
  'What projects does Giuseppe have?',
  'What topics and themes appear in synchronized knowledge?'
];

export function BrainDebugPage() {
  const [question, setQuestion] = useState(PRESET_QUESTIONS[0]);
  const [result, setResult] = useState<BrainAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (nextQuestion: string) => {
    const trimmed = nextQuestion.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/brain/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
        cache: 'no-store'
      });
      const body = (await response.json()) as BrainAnswerResponse & { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? 'Failed to get brain answer.');
      }
      setResult(body);
      setQuestion(trimmed);
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : 'Failed to get brain answer.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={styles.dashboard} data-testid="brain-dashboard">
      <header className={styles.header}>
        <p className={styles.kicker}>Debug</p>
        <h1 className={styles.title}>Brain Evidence Answer</h1>
        <p className={styles.lead}>
          Ask questions answered only from synchronized knowledge. Deterministic — no external LLM,
          no invented facts.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={event => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <label className={styles.label} htmlFor="brain-question">
          Question
        </label>
        <textarea
          id="brain-question"
          className={styles.input}
          value={question}
          onChange={event => setQuestion(event.target.value)}
          rows={3}
        />
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      <div className={styles.presets}>
        {PRESET_QUESTIONS.map(preset => (
          <button
            key={preset}
            type="button"
            className={styles.preset}
            onClick={() => void ask(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <section className={styles.result} data-testid="brain-answer-result">
          <p className={styles.meta}>
            Mode: {result.mode} · Confidence: {Math.round(result.confidence * 100)}% · Query:{' '}
            {JSON.stringify(result.query)}
          </p>
          <p className={styles.answer}>{result.answer}</p>

          {result.evidence.length > 0 ? (
            <div className={styles.evidence}>
              <h2 className={styles.evidenceTitle}>Evidence ({result.evidence.length})</h2>
              <ul className={styles.evidenceList}>
                {result.evidence.map(item => (
                  <li key={item.id} className={styles.evidenceItem}>
                    <strong>{item.label}</strong> ({item.knowledgeType}) — {item.summary}
                    {item.evidenceUrls.length > 0 ? (
                      <ul className={styles.links}>
                        {item.evidenceUrls.map(url => (
                          <li key={url}>
                            <a href={url} target="_blank" rel="noreferrer">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
