'use client';

import { useEffect } from 'react';
import { AppTopbar } from '../components/AppTopbar';
import { BrainDebugPage } from '../../src/modules/brain/components/BrainDebugPage';
import styles from './brain.module.css';

export default function BrainPage() {
  useEffect(() => {
    document.documentElement.classList.add('brain-route');
    return () => document.documentElement.classList.remove('brain-route');
  }, []);

  return (
    <div className="app app-topnav brain-app">
      <AppTopbar mode="link" />
      <main className={styles.page} role="main">
        <div className={styles.pageInner}>
          <BrainDebugPage />
        </div>
      </main>
    </div>
  );
}
