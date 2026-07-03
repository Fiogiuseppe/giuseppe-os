'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnlockPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError('Password non valida.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="shell">
      <header className="top">
        <div className="logo">GIUSEPPE OS</div>
      </header>

      <main className="main">
        <section className="unlock">
          <div className="card unlock-card">
            <div className="kicker">PRIVATE ACCESS</div>
            <h2>Unlock.</h2>
            <p>Personal operating system. Authorized access only.</p>
            <form onSubmit={handleSubmit}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              {error && <p className="unlock-error">{error}</p>}
              <button className="primary" type="submit" disabled={loading}>
                {loading ? '...' : 'Unlock'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
