'use client';

import { useEffect, useState } from 'react';

type OverallRow = {
  id: number;
  name: string;
  total_matches: string;
  wins: string;
  losses: string;
  draws: string;
};

type PositionRow = {
  id: number;
  name: string;
  position: string;
  total_matches: string;
  wins: string;
  losses: string;
};

type KeeperRow = {
  id: number;
  name: string;
  total_keeper_goals: string;
  gk_matches: string;
};

type CrawlRow = {
  id: number;
  name: string;
  crawl_count: string;
};

type Stats = {
  overall: OverallRow[];
  byPosition: PositionRow[];
  keeperGoals: KeeperRow[];
  crawls: CrawlRow[];
};

function winPct(wins: string, total: string) {
  const t = Number(total);
  if (t === 0) return '—';
  return `${Math.round((Number(wins) / t) * 100)}%`;
}

function Medal({ rank }: { rank: number }) {
  if (rank === 0) return <span className="mr-1">🥇</span>;
  if (rank === 1) return <span className="mr-1">🥈</span>;
  if (rank === 2) return <span className="mr-1">🥉</span>;
  return <span className="mr-1 text-gray-400">{rank + 1}.</span>;
}

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

  if (!stats) return <p className="text-gray-400">Loading…</p>;

  const tabs = [
    { key: 'overall', label: '🏆 Overall' },
    { key: 'position', label: '📍 By Position' },
    { key: 'keeper', label: '🧤 Keeper Goals' },
    { key: 'crawl', label: '🐛 Hall of Shame' },
  ] as const;

  const fwStats = stats.byPosition.filter((r) => r.position === 'forward');
  const gkStats = stats.byPosition.filter((r) => r.position === 'goalkeeper');

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overall' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Player</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Matches</th>
                <th className="text-center px-3 py-3 font-semibold text-green-700">Wins</th>
                <th className="text-center px-3 py-3 font-semibold text-red-500">Losses</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">Win %</th>
              </tr>
            </thead>
            <tbody>
              {stats.overall.map((row, i) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <Medal rank={i} />{row.name}
                  </td>
                  <td className="text-center px-3 py-3 text-gray-500">{row.total_matches}</td>
                  <td className="text-center px-3 py-3 text-green-700 font-semibold">{row.wins}</td>
                  <td className="text-center px-3 py-3 text-red-400">{row.losses}</td>
                  <td className="text-center px-3 py-3 font-bold text-gray-700">
                    {winPct(row.wins, row.total_matches)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.overall.length === 0 && (
            <p className="text-center text-gray-400 py-8">No matches yet.</p>
          )}
        </div>
      )}

      {tab === 'position' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">⚡ Best Forwards</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Player</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">Matches</th>
                    <th className="text-center px-3 py-3 font-semibold text-green-700">Wins</th>
                    <th className="text-center px-3 py-3 font-semibold text-red-500">Losses</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {fwStats
                    .sort((a, b) => Number(b.wins) / Math.max(Number(b.total_matches), 1) - Number(a.wins) / Math.max(Number(a.total_matches), 1))
                    .map((row, i) => (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800"><Medal rank={i} />{row.name}</td>
                        <td className="text-center px-3 py-3 text-gray-500">{row.total_matches}</td>
                        <td className="text-center px-3 py-3 text-green-700 font-semibold">{row.wins}</td>
                        <td className="text-center px-3 py-3 text-red-400">{row.losses}</td>
                        <td className="text-center px-3 py-3 font-bold">{winPct(row.wins, row.total_matches)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {fwStats.length === 0 && <p className="text-center text-gray-400 py-8">No data yet.</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">🧤 Best Goalkeepers</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Player</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">GK Matches</th>
                    <th className="text-center px-3 py-3 font-semibold text-green-700">Wins</th>
                    <th className="text-center px-3 py-3 font-semibold text-red-500">Losses</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-600">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {gkStats
                    .sort((a, b) => Number(b.wins) / Math.max(Number(b.total_matches), 1) - Number(a.wins) / Math.max(Number(a.total_matches), 1))
                    .map((row, i) => (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800"><Medal rank={i} />{row.name}</td>
                        <td className="text-center px-3 py-3 text-gray-500">{row.total_matches}</td>
                        <td className="text-center px-3 py-3 text-green-700 font-semibold">{row.wins}</td>
                        <td className="text-center px-3 py-3 text-red-400">{row.losses}</td>
                        <td className="text-center px-3 py-3 font-bold">{winPct(row.wins, row.total_matches)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {gkStats.length === 0 && <p className="text-center text-gray-400 py-8">No data yet.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'keeper' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-blue-600 font-medium">
              ⭐ Keeper goals are scored from the goalkeeper position and count double!
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Player</th>
                <th className="text-center px-3 py-3 font-semibold text-blue-600">Keeper Goals</th>
                <th className="text-center px-3 py-3 font-semibold text-gray-600">GK Matches</th>
              </tr>
            </thead>
            <tbody>
              {stats.keeperGoals.map((row, i) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <Medal rank={i} />{row.name}
                  </td>
                  <td className="text-center px-3 py-3 font-bold text-blue-600 text-lg">
                    {row.total_keeper_goals}
                  </td>
                  <td className="text-center px-3 py-3 text-gray-500">{row.gk_matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.keeperGoals.length === 0 && (
            <p className="text-center text-gray-400 py-8">No keeper goals yet.</p>
          )}
        </div>
      )}

      {tab === 'crawl' && (
        <div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 text-sm text-orange-700">
            🐛 <strong>Hall of Shame</strong> — players who lost 10-0 (on a team of ≤2) and had to crawl under the table.
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Player</th>
                  <th className="text-center px-3 py-3 font-semibold text-orange-500">Times Crawled</th>
                </tr>
              </thead>
              <tbody>
                {stats.crawls.map((row, i) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {i === 0 && <span className="mr-1">👑</span>}
                      {row.name}
                    </td>
                    <td className="text-center px-3 py-3 font-bold text-orange-500 text-lg">
                      {row.crawl_count} 🐛
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.crawls.length === 0 && (
              <p className="text-center text-gray-400 py-8">No one has crawled yet. Keep playing!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
