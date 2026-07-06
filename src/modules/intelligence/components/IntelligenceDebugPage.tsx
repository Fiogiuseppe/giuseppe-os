'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SafeKnowledgeItem } from '../../knowledge/models/knowledge.types';
import type { IntelligenceKnowledgeQuery } from '../read/intelligence-read.types';
import styles from './IntelligenceDebugPage.module.css';

type ReadResponse = {
  items: SafeKnowledgeItem[];
  count: number;
  query: IntelligenceKnowledgeQuery;
  updatedAt: string;
  error?: string;
};

const PRESETS: { label: string; params: Record<string, string> }[] = [
  { label: 'All (Giuseppe)', params: { owner: 'giuseppe' } },
  { label: 'Projects', params: { knowledgeType: 'project' } },
  { label: 'Search UREES', params: { q: 'urees' } },
  { label: 'Search Visceral Poems', params: { q: 'visceral' } }
];

function buildQueryString(params: Record<string, string>): string {
  const search = new URLSearchParams(params);
  return search.toString();
}

export function IntelligenceDebugPage() {
  const [items, setItems] = useState<SafeKnowledgeItem[]>([]);
  const [count, setCount] = useState(0);
  const [activeQuery, setActiveQuery] = useState<IntelligenceKnowledgeQuery>({ owner: 'giuseppe' });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/intelligence/knowledge?${buildQueryString(params)}`, {
        cache: 'no-store'
      });
      const body = (await response.json()) as ReadResponse;
      if (!response.ok) {
        throw new Error(body.error ?? 'Failed to load intelligence knowledge.');
      }
      setItems(body.items);
      setCount(body.count);
      setActiveQuery(body.query);
      setUpdatedAt(body.updatedAt);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load intelligence knowledge.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load({ owner: 'giuseppe' });
  }, [load]);

  return (
    <div className={styles.dashboard} data-testid="intelligence-dashboard">
      <header className={styles.header}>
        <p className={styles.kicker}>Debug</p>
        <h1 className={styles.title}>Intelligence Read</h1>
        <p className={styles.lead}>
          Query structured knowledge by owner, source, type, status, or search term. Read-only —
          no LLM, no raw provider payloads.
        </p>
        {updatedAt ? <p className={styles.updated}>Updated {new Date(updatedAt).toLocaleString()}</p> : null}
      </header>

      <div className={styles.controls}>
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            type="button"
            className={styles.preset}
            onClick={() => void load(preset.params)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <p className={styles.queryLine} data-testid="intelligence-query">
        Query: {JSON.stringify(activeQuery)} · {count} result{count === 1 ? '' : 's'}
      </p>

      {loading ? <p className={styles.state}>Loading knowledge…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <p className={styles.state}>No knowledge matches this query.</p>
      ) : null}

      <div className={styles.list}>
        {items.map(item => (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{item.label}</h2>
              <span className={styles.badge}>{item.knowledgeType}</span>
            </div>
            <p className={styles.summary}>{item.summary}</p>
            <dl className={styles.meta}>
              <div>
                <dt>Source</dt>
                <dd>{item.sourceId}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{item.status}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{Math.round(item.confidence * 100)}%</dd>
              </div>
            </dl>
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
          </article>
        ))}
      </div>
    </div>
  );
}
