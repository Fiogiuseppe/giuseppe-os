'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SafeKnowledgeItem } from '../models/knowledge.types';
import styles from './KnowledgeDebugPage.module.css';

export function KnowledgeDebugPage() {
  const [items, setItems] = useState<SafeKnowledgeItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge', { cache: 'no-store' });
      const body = (await response.json()) as { items: SafeKnowledgeItem[]; updatedAt: string; error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? 'Failed to load knowledge.');
      }
      setItems(body.items);
      setUpdatedAt(body.updatedAt);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load knowledge.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.dashboard} data-testid="knowledge-dashboard">
      <header className={styles.header}>
        <p className={styles.kicker}>Debug</p>
        <h1 className={styles.title}>Knowledge</h1>
        <p className={styles.lead}>
          Structured knowledge derived from synchronized evidence. Source-backed only — no invented
          facts.
        </p>
        {updatedAt ? <p className={styles.updated}>Updated {new Date(updatedAt).toLocaleString()}</p> : null}
      </header>

      {loading ? <p className={styles.state}>Loading knowledge…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className={styles.list}>
          {items.length === 0 ? <p className={styles.state}>No knowledge items yet. Sync a source first.</p> : null}
          {items.map(item => (
            <article key={item.id} className={styles.card} data-testid={`knowledge-item-${item.id}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{item.label}</h2>
                <span className={styles.badge}>{item.knowledgeType}</span>
              </div>
              <p className={styles.summary}>{item.summary}</p>
              <dl className={styles.meta}>
                <div>
                  <dt>Confidence</dt>
                  <dd>{item.confidence.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{item.sourceId}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{item.status}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(item.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
              {item.evidenceUrls.length > 0 ? (
                <ul className={styles.links}>
                  {item.evidenceUrls.map((url: string) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
