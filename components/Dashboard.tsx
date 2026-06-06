'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Participant = {
  player_id: number;
  player_name: string;
  team: number;
  position: string;
  keeper_goals: number;
};

type Match = {
  id: number;
  team1_score: number;
  team2_score: number;
  played_at: string;
  notes: string | null;
  participants: Participant[];
};

function teamLabel(participants: Participant[], team: number) {
  const players = participants.filter((p) => p.team === team);
  return players
    .map((p) => `${p.player_name} (${p.position === 'goalkeeper' ? 'GK' : 'FW'})`)
    .join(' & ');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/matches')
      .then((r) => r.json())
      .then((data) => {
        if (mounted) {
          setMatches(data);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  async function deleteMatch(id: number) {
    if (!confirm('Delete this match?')) return;
    await fetch('/api/matches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recent Matches</h1>
        <Link
          href="/matches/new"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Match
        </Link>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}

      {!loading && matches.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">⚽</div>
          <p className="text-lg">No matches yet.</p>
          <Link href="/matches/new" className="text-green-600 underline mt-2 inline-block">
            Add your first match
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {matches.map((m) => {
          const t1won = m.team1_score > m.team2_score;
          const t2won = m.team2_score > m.team1_score;
          const isCrawl =
            (m.team1_score === 10 && m.team2_score === 0) ||
            (m.team1_score === 0 && m.team2_score === 10);
          return (
            <div
              key={m.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex-1 text-sm ${t1won ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                      {teamLabel(m.participants, 1)}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-2xl font-bold tabular-nums ${t1won ? 'text-green-700' : 'text-gray-700'}`}>
                        {m.team1_score}
                      </span>
                      <span className="text-gray-300 text-sm">–</span>
                      <span className={`text-2xl font-bold tabular-nums ${t2won ? 'text-green-700' : 'text-gray-700'}`}>
                        {m.team2_score}
                      </span>
                    </div>
                    <div className={`flex-1 text-sm text-right ${t2won ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                      {teamLabel(m.participants, 2)}
                    </div>
                  </div>

                  {isCrawl && (
                    <p className="text-center text-xs text-orange-500 font-semibold mt-1">
                      🐛 Someone crawled under the table!
                    </p>
                  )}

                  {m.participants.some((p) => p.keeper_goals > 0) && (
                    <p className="text-center text-xs text-blue-500 mt-1">
                      {m.participants
                        .filter((p) => p.keeper_goals > 0)
                        .map((p) => `${p.player_name}: ${p.keeper_goals} keeper goal${p.keeper_goals > 1 ? 's' : ''}`)
                        .join(' · ')}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">{formatDate(m.played_at)}</p>
                  {m.notes && <p className="text-xs text-gray-500 italic mt-0.5">{m.notes}</p>}
                </div>

                <button
                  onClick={() => deleteMatch(m.id)}
                  className="ml-4 text-gray-300 hover:text-red-400 transition-colors text-lg shrink-0"
                  title="Delete match"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
