'use client';

import { useEffect, useState } from 'react';

type OverallRow = { id: number; name: string; total_matches: string; wins: string; losses: string; draws: string };
type PositionRow = { id: number; name: string; position: string; total_matches: string; wins: string; losses: string };
type KeeperRow = { id: number; name: string; total_keeper_goals: string; gk_matches: string };
type CrawlRow = { id: number; name: string; crawl_count: string };
type Stats = { overall: OverallRow[]; byPosition: PositionRow[]; keeperGoals: KeeperRow[]; crawls: CrawlRow[] };

function winPct(wins: string, total: string) {
  const t = Number(total);
  if (t === 0) return '—';
  return `${Math.round((Number(wins) / t) * 100)}%`;
}

function Medal({ rank }: { rank: number }) {
  if (rank === 0) return <span style={{ marginRight: 4 }}>🥇</span>;
  if (rank === 1) return <span style={{ marginRight: 4 }}>🥈</span>;
  if (rank === 2) return <span style={{ marginRight: 4 }}>🥉</span>;
  return <span style={{ marginRight: 4, color: 'var(--muted)' }}>{rank + 1}.</span>;
}

const panelStyle: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  borderRadius: 14,
  overflow: 'hidden',
};

const th: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--muted)',
  textAlign: 'left',
  background: 'var(--panel-2)',
  borderBottom: '1px solid var(--line)',
};

const td: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
  color: 'var(--text)',
  borderBottom: '1px solid var(--line)',
};

export default function StatsView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<'overall' | 'position' | 'keeper' | 'crawl'>('overall');

  useEffect(() => {
    let mounted = true;
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => { if (mounted) setStats(data); });
    return () => { mounted = false; };
  }, []);

  if (!stats) return <p style={{ color: 'var(--muted)' }}>Laden…</p>;

  const tabs = [
    { key: 'overall', label: '🏆 Algemeen' },
    { key: 'position', label: '📍 Per Positie' },
    { key: 'keeper', label: '🧤 Keepergoals' },
    { key: 'crawl', label: '🐛 Hall of Shame' },
  ] as const;

  const fwStats = stats.byPosition.filter((r) => r.position === 'forward');
  const gkStats = stats.byPosition.filter((r) => r.position === 'goalkeeper');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              border: '1px solid',
              cursor: 'pointer',
              background: tab === t.key ? 'var(--blue)' : 'var(--panel)',
              borderColor: tab === t.key ? 'var(--blue)' : 'var(--line)',
              color: tab === t.key ? '#fff' : 'var(--muted)',
              transition: 'background 120ms, color 120ms',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overall' && (
        <div style={panelStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Speler</th>
                <th style={{ ...th, textAlign: 'center' }}>Wedstrijden</th>
                <th style={{ ...th, textAlign: 'center', color: '#4ade80' }}>Gewonnen</th>
                <th style={{ ...th, textAlign: 'center', color: '#ff6259' }}>Verloren</th>
                <th style={{ ...th, textAlign: 'center' }}>Win %</th>
              </tr>
            </thead>
            <tbody>
              {stats.overall.map((row, i) => (
                <tr key={row.id}>
                  <td style={td}><Medal rank={i} />{row.name}</td>
                  <td style={{ ...td, textAlign: 'center', color: 'var(--muted)' }}>{row.total_matches}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{row.wins}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#ff6259' }}>{row.losses}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{winPct(row.wins, row.total_matches)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.overall.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Nog geen wedstrijden.</p>}
        </div>
      )}

      {tab === 'position' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[{ label: '⚡ Beste Aanvallers', rows: fwStats }, { label: '🧤 Beste Keepers', rows: gkStats }].map(({ label, rows }) => (
            <div key={label}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>{label}</h2>
              <div style={panelStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}>Speler</th>
                      <th style={{ ...th, textAlign: 'center' }}>Wedstrijden</th>
                      <th style={{ ...th, textAlign: 'center', color: '#4ade80' }}>Gewonnen</th>
                      <th style={{ ...th, textAlign: 'center', color: '#ff6259' }}>Verloren</th>
                      <th style={{ ...th, textAlign: 'center' }}>Win %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows
                      .sort((a, b) => Number(b.wins) / Math.max(Number(b.total_matches), 1) - Number(a.wins) / Math.max(Number(a.total_matches), 1))
                      .map((row, i) => (
                        <tr key={row.id}>
                          <td style={td}><Medal rank={i} />{row.name}</td>
                          <td style={{ ...td, textAlign: 'center', color: 'var(--muted)' }}>{row.total_matches}</td>
                          <td style={{ ...td, textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{row.wins}</td>
                          <td style={{ ...td, textAlign: 'center', color: '#ff6259' }}>{row.losses}</td>
                          <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{winPct(row.wins, row.total_matches)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {rows.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Nog geen data.</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'keeper' && (
        <div style={panelStyle}>
          <div style={{ padding: '10px 14px', background: 'rgba(42,111,219,0.12)', borderBottom: '1px solid var(--line)', fontSize: 13, color: '#5a96f5' }}>
            ⭐ Keepergoals worden gescoord vanuit de keeperspositie en tellen dubbel!
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Speler</th>
                <th style={{ ...th, textAlign: 'center', color: '#5a96f5' }}>Keepergoals</th>
                <th style={{ ...th, textAlign: 'center' }}>Keeper wedstrijden</th>
              </tr>
            </thead>
            <tbody>
              {stats.keeperGoals.map((row, i) => (
                <tr key={row.id}>
                  <td style={td}><Medal rank={i} />{row.name}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#5a96f5', fontWeight: 700, fontSize: 18 }}>{row.total_keeper_goals}</td>
                  <td style={{ ...td, textAlign: 'center', color: 'var(--muted)' }}>{row.gk_matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.keeperGoals.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Nog geen keepergoals.</p>}
        </div>
      )}

      {tab === 'crawl' && (
        <div>
          <div style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#fb923c' }}>
            🐛 <strong>Hall of Shame</strong> — spelers die 10-0 hebben verloren en onder de tafel door moesten kruipen.
          </div>
          <div style={panelStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Speler</th>
                  <th style={{ ...th, textAlign: 'center', color: '#fb923c' }}>Keer gekropen</th>
                </tr>
              </thead>
              <tbody>
                {stats.crawls.map((row, i) => (
                  <tr key={row.id}>
                    <td style={td}>{i === 0 && <span style={{ marginRight: 4 }}>👑</span>}{row.name}</td>
                    <td style={{ ...td, textAlign: 'center', color: '#fb923c', fontWeight: 700, fontSize: 18 }}>{row.crawl_count} 🐛</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.crawls.length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Nog niemand gekropen. Blijf spelen!</p>}
          </div>
        </div>
      )}
    </div>
  );
}
