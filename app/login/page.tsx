'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Verkeerd wachtwoord. Probeer opnieuw.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(1200px 700px at 50% -10%, #1b1f2a 0%, var(--bg) 60%)',
    }}>
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: 36,
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>⚽</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Tafelvoetbal</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Voer het wachtwoord in om door te gaan</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wachtwoord"
            autoFocus
            style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: '11px 14px',
              color: 'var(--text)',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          />
          {error && <p style={{ color: '#ff6259', fontSize: 13 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--panel-2)' : 'var(--blue)',
              border: 'none',
              borderRadius: 10,
              padding: '11px',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 120ms',
            }}
          >
            {loading ? 'Controleren…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
