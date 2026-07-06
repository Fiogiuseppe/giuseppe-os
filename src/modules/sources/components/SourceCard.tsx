'use client';

import type { SourceProviderStatus } from '../providers/source-provider.types';
import styles from './SourceCard.module.css';

type SourceCardProps = {
  source: SourceProviderStatus;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
};

function formatLastSync(iso: string | null): string {
  if (!iso) {
    return 'Never';
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function connectionLabel(status: SourceProviderStatus['connectionStatus']): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'disconnected':
      return 'Disconnected';
    case 'needs_auth':
      return 'Needs authorization';
    case 'error':
      return 'Error';
    default:
      return status;
  }
}

function healthLabel(status: SourceProviderStatus['healthStatus']): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'unavailable':
      return 'Unavailable';
    case 'unknown':
      return 'Unknown';
    default:
      return status;
  }
}

export function SourceCard({ source, busy, onConnect, onDisconnect, onSync }: SourceCardProps) {
  const isFuture = source.availability === 'future';
  const isConnected = source.connectionStatus === 'connected';
  const canSync = isConnected && !busy && !isFuture;
  const canConnect = !isFuture && !busy;

  return (
    <article
      className={`${styles.card} ${isFuture ? styles.cardFuture : ''}`}
      data-testid={`source-card-${source.id}`}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>{source.category}</p>
          <h2 className={styles.title}>{source.label}</h2>
          <p className={styles.description}>{source.description}</p>
        </div>
        <div className={styles.badges}>
          {isFuture ? (
            <span className={`${styles.badge} ${styles.badgeFuture}`}>In futuro</span>
          ) : null}
          <span className={`${styles.badge} ${styles[`badgeConnection_${source.connectionStatus}`]}`}>
            {connectionLabel(source.connectionStatus)}
          </span>
          <span className={`${styles.badge} ${styles[`badgeHealth_${source.healthStatus}`]}`}>
            {healthLabel(source.healthStatus)}
          </span>
        </div>
      </header>

      <dl className={styles.meta}>
        <div>
          <dt>Last sync</dt>
          <dd>{formatLastSync(source.lastSyncAt)}</dd>
        </div>
        {source.healthNote ? (
          <div>
            <dt>Health note</dt>
            <dd>{source.healthNote}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.section} aria-label={`${source.label} permissions`}>
        <h3 className={styles.sectionTitle}>Permissions</h3>
        <ul className={styles.list}>
          {source.permissions.map(permission => (
            <li
              key={permission}
              className={
                source.permissionsGranted.includes(permission) ? styles.listGranted : undefined
              }
            >
              {permission}
              {source.permissionsGranted.includes(permission) ? (
                <span className={styles.grantedMark}> granted</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-label={`${source.label} data collected`}>
        <h3 className={styles.sectionTitle}>Data collected</h3>
        <ul className={styles.list}>
          {source.dataCollected.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <footer className={styles.actions}>
        {isFuture ? (
          <p className={styles.futureNote}>Planned integration — not available yet.</p>
        ) : isConnected ? (
          <button type="button" className={styles.buttonSecondary} disabled={busy} onClick={onDisconnect}>
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            className={styles.buttonPrimary}
            disabled={!canConnect}
            onClick={onConnect}
          >
            Connect
          </button>
        )}
        {!isFuture ? (
          <button type="button" className={styles.buttonPrimary} disabled={!canSync} onClick={onSync}>
            Sync now
          </button>
        ) : null}
      </footer>
    </article>
  );
}
