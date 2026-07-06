'use client';

import { useEffect } from 'react';
import { AppTopbar } from '../components/AppTopbar';
import { IntelligenceDebugPage } from '../../src/modules/intelligence/components/IntelligenceDebugPage';
import styles from './intelligence.module.css';

export default function IntelligencePage() {
  useEffect(() => {
    document.documentElement.classList.add('intelligence-route');
    return () => document.documentElement.classList.remove('intelligence-route');
  }, []);

  return (
    <div className="app app-topnav intelligence-app">
      <AppTopbar mode="link" />
      <main className={styles.page} role="main">
        <div className={styles.pageInner}>
          <IntelligenceDebugPage />
        </div>
      </main>
    </div>
  );
}
