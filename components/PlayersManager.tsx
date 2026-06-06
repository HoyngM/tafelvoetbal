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
      setError(data.error ?? 'Failed to add player.');
    }
  }

  async function deletePlayer(id: number, name: string) {
    if (!confirm(`Remove ${name}? This will not delete their match history.`)) return;
    await fetch('/api/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="max-w-md flex flex-col gap-6">
      <form onSubmit={addPlayer} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError(''); }}
          placeholder="Player name…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          maxLength={100}
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {adding ? '…' : 'Add'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm px-1">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {players.length === 0 && (
          <p className="text-gray-400 text-center py-8 text-sm">No players yet. Add some!</p>
        )}
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between px-4 py-3 ${
              i < players.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <span className="text-sm font-medium text-gray-800">{p.name}</span>
            <button
              onClick={() => deletePlayer(p.id, p.name)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg"
              title="Remove player"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
