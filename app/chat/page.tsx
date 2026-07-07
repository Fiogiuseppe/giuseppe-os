'use client';

import { useEffect } from 'react';
import { IdentityCompanionChat } from '../components/IdentityCompanionChat';
import styles from './chat.module.css';

export default function ChatPage() {
  useEffect(() => {
    document.documentElement.classList.add('chat-route');
    return () => document.documentElement.classList.remove('chat-route');
  }, []);

  return (
    <div className={`app chat-app ${styles.app}`}>
      <main className={styles.page}>
        <IdentityCompanionChat />
      </main>
    </div>
  );
}
