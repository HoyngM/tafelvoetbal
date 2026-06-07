'use client';

import { useEffect, useState } from 'react';

type Player = { id: number; name: string };

export default function PlayersManager() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/players')
      .then((r) => r.json())
      .then((data) => { if (mounted) setPlayers(data); });
    return () => { mounted = false; };
  }, []);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setAdding(false);
    if (res.ok) {
      const player = await res.json();
      setPlayers((prev) => [...prev, player].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Speler toevoegen mislukt.');
    }
  }

  async function deletePlayer(id: number, name: string) {
    if (!confirm(`${name} verwijderen? Dit verwijdert hun wedstrijdgeschiedenis niet.`)) return;
    await fetch('/api/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'var(--panel-2)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: 13,
    fontFamily: 'inherit',
  };

  const panelStyle: React.CSSProperties = {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: 14,
  };

  return (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <form onSubmit={addPlayer} style={{ ...panelStyle, padding: '14px', display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError(''); }}
          placeholder="Spelernaam…"
          style={inputStyle}
          maxLength={100}
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          style={{
            background: adding || !newName.trim() ? 'var(--panel-2)' : 'var(--blue)',
            border: '1px solid var(--line)',
            color: adding || !newName.trim() ? 'var(--muted)' : '#fff',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: adding || !newName.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 120ms',
          }}
        >
          {adding ? '…' : 'Toevoegen'}
        </button>
      </form>

      {error && <p style={{ color: '#ff6259', fontSize: 13, paddingLeft: 4 }}>{error}</p>}

      <div style={panelStyle}>
        {players.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0', fontSize: 13 }}>
            Nog geen spelers. Voeg er wat toe!
          </p>
        )}
        {players.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: i < players.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{p.name}</span>
            <button
              onClick={() => deletePlayer(p.id, p.name)}
              style={{ background: 'none', border: 'none', color: 'var(--line)', cursor: 'pointer', fontSize: 20 }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--red)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--line)')}
              title="Verwijder speler"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
