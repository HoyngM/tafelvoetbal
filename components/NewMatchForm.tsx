'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Player = { id: number; name: string };

type TeamSlot = {
  player_id: number | null;
  position: 'forward' | 'goalkeeper';
  keeper_goals: number;
};

const emptySlot = (): TeamSlot => ({ player_id: null, position: 'forward', keeper_goals: 0 });

function usedIds(team: TeamSlot[]) {
  return team.map((s) => s.player_id).filter(Boolean) as number[];
}

function updateSlot(
  team: TeamSlot[],
  setTeam: (t: TeamSlot[]) => void,
  idx: number,
  patch: Partial<TeamSlot>,
) {
  setTeam(team.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
}

function TeamSection({
  label,
  players,
  team,
  setTeam,
  otherTeam,
}: {
  label: string;
  players: Player[];
  team: TeamSlot[];
  setTeam: (t: TeamSlot[]) => void;
  otherTeam: TeamSlot[];
}) {
  const takenIds = [...usedIds(team), ...usedIds(otherTeam)];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">{label}</h3>
        {team.length === 1 ? (
          <button
            type="button"
            onClick={() => setTeam([...team, emptySlot()])}
            className="text-xs text-green-600 hover:underline"
          >
            + Add 2nd player
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setTeam([team[0]])}
            className="text-xs text-red-400 hover:underline"
          >
            − Remove 2nd player
          </button>
        )}
      </div>

      {team.map((slot, idx) => (
        <div key={idx} className="flex flex-col gap-2 border-t border-gray-100 pt-3 first:border-0 first:pt-0">
          <label className="text-xs font-medium text-gray-500">
            Player {team.length > 1 ? idx + 1 : ''}
          </label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={slot.player_id ?? ''}
            onChange={(e) =>
              updateSlot(team, setTeam, idx, { player_id: Number(e.target.value) || null })
            }
          >
            <option value="">Select player…</option>
            {players.map((p) => (
              <option
                key={p.id}
                value={p.id}
                disabled={takenIds.includes(p.id) && p.id !== slot.player_id}
              >
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {(['forward', 'goalkeeper'] as const).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => updateSlot(team, setTeam, idx, { position: pos })}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                  slot.position === pos
                    ? 'bg-green-600 border-green-600 text-white font-semibold'
                    : 'border-gray-200 text-gray-500 hover:border-green-400'
                }`}
              >
                {pos === 'forward' ? '⚡ Forward' : '🧤 Goalkeeper'}
              </button>
            ))}
          </div>

          {slot.position === 'goalkeeper' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Keeper goals scored:</label>
              <input
                type="number"
                min={0}
                max={10}
                value={slot.keeper_goals}
                onChange={(e) =>
                  updateSlot(team, setTeam, idx, {
                    keeper_goals: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-xs text-blue-500">⭐ ×2 pts</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function NewMatchForm() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [team1, setTeam1] = useState<TeamSlot[]>([emptySlot()]);
  const [team2, setTeam2] = useState<TeamSlot[]>([emptySlot()]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch('/api/players')
      .then((r) => r.json())
      .then((data) => { if (mounted) setPlayers(data); });
    return () => { mounted = false; };
  }, []);

  function validate(): string | null {
    const allSlots = [...team1, ...team2];
    if (allSlots.some((s) => s.player_id === null)) return 'Please select all players.';
    const ids = allSlots.map((s) => s.player_id);
    if (new Set(ids).size !== ids.length) return 'A player can only be in one slot.';
    if (score1 < 0 || score2 < 0) return 'Scores must be non-negative.';
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');

    const participants = [
      ...team1.map((s) => ({
        player_id: s.player_id!,
        team: 1,
        position: s.position,
        keeper_goals: s.position === 'goalkeeper' ? s.keeper_goals : 0,
      })),
      ...team2.map((s) => ({
        player_id: s.player_id!,
        team: 2,
        position: s.position,
        keeper_goals: s.position === 'goalkeeper' ? s.keeper_goals : 0,
      })),
    ];

    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team1_score: score1,
        team2_score: score2,
        notes: notes || null,
        participants,
      }),
    });

    setSaving(false);
    if (res.ok) {
      router.push('/');
    } else {
      setError('Failed to save match.');
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <TeamSection label="Team 1" players={players} team={team1} setTeam={setTeam1} otherTeam={team2} />
        <TeamSection label="Team 2" players={players} team={team2} setTeam={setTeam2} otherTeam={team1} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Score</h3>
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">Team 1</span>
            <input
              type="number"
              min={0}
              max={10}
              value={score1}
              onChange={(e) => setScore1(Math.max(0, Number(e.target.value)))}
              className="w-20 text-center text-3xl font-bold border border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <span className="text-2xl text-gray-300 font-bold mt-5">–</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">Team 2</span>
            <input
              type="number"
              min={0}
              max={10}
              value={score2}
              onChange={(e) => setScore2(Math.max(0, Number(e.target.value)))}
              className="w-20 text-center text-3xl font-bold border border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {((score1 === 10 && score2 === 0) || (score1 === 0 && score2 === 10)) && (
          <p className="text-center text-orange-500 text-sm font-semibold mt-3">
            🐛 Someone&apos;s crawling under the table!
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Final of the day"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {saving ? 'Saving…' : 'Save Match'}
      </button>
    </form>
  );
}
