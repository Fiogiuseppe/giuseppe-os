'use client';

import { useEffect } from 'react';
import { AppTopbar } from '../components/AppTopbar';
import { KnowledgeDebugPage } from '../../src/modules/knowledge/components/KnowledgeDebugPage';
import styles from './knowledge.module.css';

export default function KnowledgePage() {
  useEffect(() => {
    document.documentElement.classList.add('knowledge-route');
    return () => document.documentElement.classList.remove('knowledge-route');
  }, []);

  return (
    <div className="app app-topnav knowledge-app">
      <AppTopbar mode="link" />
      <main className={styles.page} role="main">
        <div className={styles.pageInner}>
          <KnowledgeDebugPage />
        </div>
      </main>
    </div>
  );
}
