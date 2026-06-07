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
  return participants
    .filter((p) => p.team === team)
    .map((p) => `${p.player_name} (${p.position === 'goalkeeper' ? 'K' : 'A'})`)
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

const panel: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: 14,
  padding: '14px 18px',
};

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/matches')
      .then((r) => r.json())
      .then((data) => {
        if (mounted) { setMatches(data); setLoading(false); }
      });
    return () => { mounted = false; };
  }, []);

  async function deleteMatch(id: number) {
    if (!confirm('Wedstrijd verwijderen?')) return;
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
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Recente wedstrijden</h1>
        <Link
          href="/matches/new"
          style={{
            background: 'var(--blue)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + Wedstrijd bijhouden
        </Link>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Laden…</p>}

      {!loading && matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
          <p style={{ fontSize: 16 }}>Nog geen wedstrijden.</p>
          <Link href="/matches/new" style={{ color: 'var(--blue)', marginTop: 8, display: 'inline-block' }}>
            Voeg je eerste wedstrijd toe
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {matches.map((m) => {
          const t1won = m.team1_score > m.team2_score;
          const t2won = m.team2_score > m.team1_score;
          const isCrawl =
            (m.team1_score === 10 && m.team2_score === 0) ||
            (m.team1_score === 0 && m.team2_score === 10);
          return (
            <div key={m.id} style={panel}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-3">
                    <div style={{ flex: 1, fontSize: 13, color: t1won ? '#4ade80' : 'var(--muted)', fontWeight: t1won ? 700 : 400 }}>
                      {teamLabel(m.participants, 1)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: t1won ? '#4ade80' : 'var(--text)' }}>
                        {m.team1_score}
                      </span>
                      <span style={{ color: 'var(--line)', fontSize: 14 }}>–</span>
                      <span style={{ fontSize: 22, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: t2won ? '#4ade80' : 'var(--text)' }}>
                        {m.team2_score}
                      </span>
                    </div>
                    <div style={{ flex: 1, fontSize: 13, textAlign: 'right', color: t2won ? '#4ade80' : 'var(--muted)', fontWeight: t2won ? 700 : 400 }}>
                      {teamLabel(m.participants, 2)}
                    </div>
                  </div>

                  {isCrawl && (
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#fb923c', fontWeight: 600, marginTop: 4 }}>
                      🐛 Iemand heeft onder de tafel gekropen!
                    </p>
                  )}

                  {m.participants.some((p) => p.keeper_goals > 0) && (
                    <p style={{ textAlign: 'center', fontSize: 12, color: '#5a96f5', marginTop: 4 }}>
                      {m.participants
                        .filter((p) => p.keeper_goals > 0)
                        .map((p) => `${p.player_name}: ${p.keeper_goals} keepergoal${p.keeper_goals > 1 ? 's' : ''}`)
                        .join(' · ')}
                    </p>
                  )}

                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{formatDate(m.played_at)}</p>
                  {m.notes && <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2 }}>{m.notes}</p>}
                </div>

                <button
                  onClick={() => deleteMatch(m.id)}
                  style={{ marginLeft: 16, background: 'none', border: 'none', color: 'var(--line)', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--red)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--line)')}
                  title="Verwijder wedstrijd"
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
