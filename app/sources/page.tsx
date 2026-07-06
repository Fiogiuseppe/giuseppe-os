'use client';

import { useEffect } from 'react';
import { AppTopbar } from '../components/AppTopbar';
import { SourcesDashboard } from '../../src/modules/sources/components/SourcesDashboard';
import styles from './sources.module.css';

export default function SourcesPage() {
  useEffect(() => {
    document.documentElement.classList.add('sources-route');
    return () => document.documentElement.classList.remove('sources-route');
  }, []);

  return (
    <div className="app app-topnav sources-app">
      <AppTopbar mode="link" />
      <main className={styles.page} role="main">
        <div className={styles.pageInner}>
          <SourcesDashboard />
        </div>
      </main>
    </div>
  );
}
