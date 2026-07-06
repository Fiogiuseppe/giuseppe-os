'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SourceProviderId, SourceProviderStatus } from '../providers/source-provider.types';
import { groupSources } from '../providers/source-groups';
import { fetchSources, runSourceAction, startOAuthConnect } from '../services/sources.client';
import { SourceCard } from './SourceCard';
import styles from './SourcesDashboard.module.css';

export function SourcesDashboard() {
  const [sources, setSources] = useState<SourceProviderStatus[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<SourceProviderId | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sections = useMemo(() => groupSources(sources), [sources]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchSources();
      setSources(response.sources);
      setUpdatedAt(response.updatedAt);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load sources.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const oauthError = params.get('oauth_error');

    if (connected) {
      setToast(`${connected} connected via OAuth.`);
      window.history.replaceState({}, '', '/sources');
    } else if (oauthError) {
      setToast(`OAuth error: ${oauthError.replace(/_/g, ' ')}`);
      window.history.replaceState({}, '', '/sources');
    }
  }, [load]);

  async function handleConnect(source: SourceProviderStatus) {
    setToast('Connect is available in Phase 2.');
  }

  async function handleAction(sourceId: SourceProviderId, action: 'connect' | 'disconnect' | 'sync') {
    setBusyId(sourceId);
    setToast(null);

    try {
      const response = await runSourceAction(sourceId, action);
      setSources(current =>
        current.map(source => (source.id === sourceId ? response.source : source))
      );
      setToast(response.message);
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Action failed.';
      setToast(message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.dashboard} data-testid="sources-dashboard">
      <header className={styles.header}>
        <p className={styles.kicker}>Personal data</p>
        <h1 className={styles.title}>Sources</h1>
        <p className={styles.lead}>
          Connect Giuseppe&apos;s life outputs — read-only ingestion with server-side OAuth. The UI
          never sees tokens or secrets.
        </p>
        {updatedAt ? (
          <p className={styles.updated}>Status refreshed {new Date(updatedAt).toLocaleString()}</p>
        ) : null}
      </header>

      {loading ? <p className={styles.state}>Loading sources…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className={styles.sections}>
          {sections.map(({ group, sources: groupSources }) => (
            <section
              key={group.id}
              className={styles.group}
              aria-labelledby={`source-group-${group.id}`}
              data-testid={`source-group-${group.id}`}
            >
              <header className={styles.groupHeader}>
                <div className={styles.groupTitleRow}>
                  <h2 className={styles.groupTitle} id={`source-group-${group.id}`}>
                    {group.label}
                  </h2>
                </div>
                <p className={styles.groupDescription}>{group.description}</p>
              </header>
              <div className={styles.grid}>
                {groupSources.map(source => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    busy={busyId === source.id}
                    onConnect={() => void handleConnect(source)}
                    onDisconnect={() => void handleAction(source.id, 'disconnect')}
                    onSync={() => void handleAction(source.id, 'sync')}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {toast ? (
        <p className={styles.toast} role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
