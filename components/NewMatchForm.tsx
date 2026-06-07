'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import s from './NewMatchForm.module.css';

type Player = { id: number; name: string };

type TeamSlot = {
  player_id: number | null;
  position: 'forward' | 'goalkeeper';
  keeper_goals: number;
};

const WIN_SCORE = 10;

const ROD_LAYOUT = [
  { side: 'top' as const, count: 1, y: 0.045 },
  { side: 'top' as const, count: 2, y: 0.155 },
  { side: 'bottom' as const, count: 3, y: 0.30 },
  { side: 'top' as const, count: 5, y: 0.43 },
  { side: 'bottom' as const, count: 5, y: 0.57 },
  { side: 'top' as const, count: 3, y: 0.70 },
  { side: 'bottom' as const, count: 2, y: 0.845 },
  { side: 'bottom' as const, count: 1, y: 0.955 },
];

const keeperSlot = (): TeamSlot => ({ player_id: null, position: 'goalkeeper', keeper_goals: 0 });
const forwardSlot = (): TeamSlot => ({ player_id: null, position: 'forward', keeper_goals: 0 });

// ---- Field & table components ----

function FieldLines() {
  return (
    <svg className={s.lines} viewBox="0 0 100 167" preserveAspectRatio="none">
      <rect x="1" y="1" width="98" height="165" fill="none" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.8" />
      <line x1="1" y1="83.5" x2="99" y2="83.5" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.7" />
      <circle cx="50" cy="83.5" r="11" fill="none" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.7" />
      <circle cx="50" cy="83.5" r="0.8" fill="var(--felt-line)" opacity="0.9" />
      <rect x="22" y="1" width="56" height="18" fill="none" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.7" />
      <rect x="35" y="1" width="30" height="8" fill="none" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.7" />
      <rect x="22" y="148" width="56" height="18" fill="none" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.7" />
      <rect x="35" y="158" width="30" height="8" fill="none" stroke="var(--felt-line)" strokeWidth="0.5" opacity="0.7" />
      <rect x="40" y="-0.5" width="20" height="2" fill="rgba(0,0,0,0.45)" stroke="var(--felt-line)" strokeWidth="0.4" />
      <rect x="40" y="165.5" width="20" height="2" fill="rgba(0,0,0,0.45)" stroke="var(--felt-line)" strokeWidth="0.4" />
    </svg>
  );
}

function Figure({ team }: { team: 'red' | 'blue' }) {
  return (
    <div className={`${s.fig} ${team === 'red' ? s.figRed : s.figBlue}`}>
      <div className={s.figShoulders} />
      <div className={s.figHead} />
    </div>
  );
}

function Rod({ rod, teamAtTop }: { rod: typeof ROD_LAYOUT[0]; teamAtTop: 'red' | 'blue' }) {
  const team: 'red' | 'blue' = rod.side === 'top' ? teamAtTop : (teamAtTop === 'red' ? 'blue' : 'red');
  return (
    <>
      <div className={s.rod} style={{ top: `${rod.y * 100}%` }}>
        <div className={s.bar} />
        <div className={`${s.handle} ${s.handleLeft}`} />
        <div className={`${s.handle} ${s.handleRight}`} />
      </div>
      <div className={s.rowFigs} style={{ top: `${rod.y * 100}%` }}>
        {Array.from({ length: rod.count }, (_, i) => <Figure key={i} team={team} />)}
      </div>
    </>
  );
}

function FoosballTable({ teamAtTop }: { teamAtTop: 'red' | 'blue' }) {
  return (
    <div className={s.table}>
      <span className={s.screw} style={{ top: 8, left: 8 }} />
      <span className={s.screw} style={{ top: 8, right: 8 }} />
      <span className={s.screw} style={{ bottom: 8, left: 8 }} />
      <span className={s.screw} style={{ bottom: 8, right: 8 }} />
      <div className={s.field}>
        <FieldLines />
        {ROD_LAYOUT.map((rod, i) => <Rod key={i} rod={rod} teamAtTop={teamAtTop} />)}
        <div className={s.ball} />
      </div>
    </div>
  );
}

// ---- Scoreboard ----

function Scoreboard({
  team, label, slots, players, score, onAdd, onSub, isWinner, popKey,
}: {
  team: 'red' | 'blue';
  label: string;
  slots: TeamSlot[];
  players: Player[];
  score: number;
  onAdd: () => void;
  onSub: () => void;
  isWinner: boolean;
  popKey: number;
}) {
  const names = slots.map((sl) => players.find((p) => p.id === sl.player_id)?.name ?? '—');
  return (
    <div className={[s.scoreboard, team === 'red' ? s.scoreboardRed : s.scoreboardBlue, isWinner ? s.scoreboardWinner : ''].join(' ')}>
      <div className={s.teamInfo}>
        <div className={`${s.teamMark} ${team === 'red' ? s.teamMarkRed : s.teamMarkBlue}`}>
          {label[0]}
        </div>
        <div className={s.teamMeta}>
          <div className={s.teamName}>
            Team {label}
            {isWinner && <span className={s.winnerPill}>★ Winnaar</span>}
          </div>
          <div className={s.teamPlayers}>
            {names.map((n, i) => <span key={i}>{i > 0 && ' & '}<b>{n}</b></span>)}
          </div>
        </div>
      </div>
      <div className={s.scoreCluster}>
        <button className={s.scoreBtn} onClick={onSub} disabled={score <= 0} aria-label="−">−</button>
        <div
          key={popKey}
          className={[s.scoreNum, team === 'red' ? s.scoreNumRed : s.scoreNumBlue, s.scoreNumPop].join(' ')}
          onClick={score < WIN_SCORE ? onAdd : undefined}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && score < WIN_SCORE) { e.preventDefault(); onAdd(); } }}
        >
          {score}<span className={s.scoreDivider}>/{WIN_SCORE}</span>
        </div>
        <button className={s.scoreBtn} onClick={onAdd} disabled={score >= WIN_SCORE} aria-label="+">+</button>
      </div>
    </div>
  );
}

// ---- Player slot ----

function PlayerSlot({
  idx, team, players, slot, takenIds, onChange, onRemove,
}: {
  idx: number;
  team: 'red' | 'blue';
  players: Player[];
  slot: TeamSlot;
  takenIds: number[];
  onChange: (patch: Partial<TeamSlot>) => void;
  onRemove?: () => void;
}) {
  const label = idx === 0 ? 'Keeper' : 'Aanvaller';
  return (
    <div className={s.slot}>
      <div className={s.slotLabelRow}>
        <span className={s.slotLabel}>{label}</span>
        {onRemove && (
          <button className={s.slotRemove} onClick={onRemove} title="Verwijder speler" type="button">×</button>
        )}
      </div>
      <div className={s.selectWrap}>
        <select
          className={`${s.playerSelect} ${team === 'red' ? s.playerSelectRed : s.playerSelectBlue}`}
          value={slot.player_id ?? ''}
          onChange={(e) => onChange({ player_id: Number(e.target.value) || null })}
        >
          <option value="">— Kies speler —</option>
          {players.map((p) => (
            <option key={p.id} value={p.id} disabled={takenIds.includes(p.id) && p.id !== slot.player_id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {/* Keeper goals always visible on slot 0 */}
      {idx === 0 && (
        <div className={s.keeperGoalsRow}>
          <span className={s.keeperGoalsLabel}>Keepergoals:</span>
          <input
            type="number"
            min={0}
            max={WIN_SCORE}
            value={slot.keeper_goals}
            onChange={(e) => onChange({ keeper_goals: Math.max(0, Number(e.target.value)) })}
            className={s.keeperGoalsInput}
          />
          <span className={s.keeperBadge}>×2</span>
        </div>
      )}
    </div>
  );
}

// ---- Side panel ----

function SidePanel({
  team, label, players, slots, setSlots, otherSlots,
}: {
  team: 'red' | 'blue';
  label: string;
  players: Player[];
  slots: TeamSlot[];
  setSlots: (s: TeamSlot[]) => void;
  otherSlots: TeamSlot[];
}) {
  const takenIds = [
    ...slots.map((sl) => sl.player_id),
    ...otherSlots.map((sl) => sl.player_id),
  ].filter(Boolean) as number[];

  function updateSlot(idx: number, patch: Partial<TeamSlot>) {
    setSlots(slots.map((sl, i) => (i === idx ? { ...sl, ...patch } : sl)));
  }

  return (
    <aside className={s.side}>
      <div className={s.sideHead}>
        <span className={`${s.swatch} ${team === 'red' ? s.swatchRed : s.swatchBlue}`} />
        Team {label}
      </div>

      {slots.map((slot, idx) => (
        <PlayerSlot
          key={idx}
          idx={idx}
          team={team}
          players={players}
          slot={slot}
          takenIds={takenIds}
          onChange={(patch) => updateSlot(idx, patch)}
          onRemove={idx === 1 ? () => setSlots(slots.slice(0, 1)) : undefined}
        />
      ))}

      {slots.length === 1 && (
        <button
          type="button"
          className={s.addSlotBtn}
          onClick={() => setSlots([slots[0], forwardSlot()])}
        >
          + Aanvaller toevoegen
        </button>
      )}
    </aside>
  );
}

// ---- Main component ----

export default function NewMatchForm() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamAtTop, setTeamAtTop] = useState<'red' | 'blue'>('red');
  // Both teams default to WIN_SCORE so user only needs to adjust the loser's score
  const [scores, setScores] = useState({ red: WIN_SCORE, blue: WIN_SCORE });
  const [popKey, setPopKey] = useState({ red: 0, blue: 0 });
  const [redSlots, setRedSlots] = useState<TeamSlot[]>([keeperSlot(), forwardSlot()]);
  const [blueSlots, setBlueSlots] = useState<TeamSlot[]>([keeperSlot(), forwardSlot()]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/players').then((r) => r.json()).then(setPlayers);
  }, []);

  const winner = useMemo<'red' | 'blue' | null>(() => {
    if (scores.red >= WIN_SCORE && scores.red > scores.blue) return 'red';
    if (scores.blue >= WIN_SCORE && scores.blue > scores.red) return 'blue';
    return null;
  }, [scores]);

  // addScore does NOT block on winner — both teams can always score
  const addScore = useCallback((team: 'red' | 'blue') => {
    setScores((prev) => ({ ...prev, [team]: Math.min(WIN_SCORE, prev[team] + 1) }));
    setPopKey((prev) => ({ ...prev, [team]: prev[team] + 1 }));
  }, []);

  const subScore = useCallback((team: 'red' | 'blue') => {
    setScores((prev) => ({ ...prev, [team]: Math.max(0, prev[team] - 1) }));
  }, []);

  const reset = useCallback(() => {
    setScores({ red: WIN_SCORE, blue: WIN_SCORE });
    setSaveError('');
  }, []);

  const swapSides = useCallback(() => {
    setTeamAtTop((t) => (t === 'red' ? 'blue' : 'red'));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT') return;
      if (e.key === 'q' || e.key === 'Q') addScore('red');
      if (e.key === 'a' || e.key === 'A') subScore('red');
      if (e.key === 'p' || e.key === 'P') addScore('blue');
      if (e.key === 'l' || e.key === 'L') subScore('blue');
      if (e.key === 's' || e.key === 'S') swapSides();
      if (e.key === 'r' || e.key === 'R') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addScore, subScore, swapSides, reset]);

  async function saveMatch() {
    const allSlots = [...redSlots, ...blueSlots];
    if (allSlots.some((sl) => sl.player_id === null)) {
      setSaveError('Selecteer alle spelers.');
      return;
    }
    setSaving(true);
    setSaveError('');

    const participants = [
      ...redSlots.map((sl, idx) => ({
        player_id: sl.player_id!,
        team: 1,
        position: sl.position,
        keeper_goals: idx === 0 ? sl.keeper_goals : 0,
      })),
      ...blueSlots.map((sl, idx) => ({
        player_id: sl.player_id!,
        team: 2,
        position: sl.position,
        keeper_goals: idx === 0 ? sl.keeper_goals : 0,
      })),
    ];

    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team1_score: scores.red,
        team2_score: scores.blue,
        notes: notes.trim() || null,
        participants,
      }),
    });

    setSaving(false);
    if (res.ok) {
      router.push('/');
    } else {
      setSaveError('Wedstrijd opslaan mislukt. Probeer opnieuw.');
    }
  }

  const topTeam = teamAtTop;
  const bottomTeam: 'red' | 'blue' = teamAtTop === 'red' ? 'blue' : 'red';
  const teamLabel = (t: 'red' | 'blue') => (t === 'red' ? 'Rood' : 'Blauw');
  const isCrawl =
    (scores.red === WIN_SCORE && scores.blue === 0) ||
    (scores.blue === WIN_SCORE && scores.red === 0);

  return (
    <div>
      {/* Top bar */}
      <div className={s.topbar}>
        <div className={s.brand}>
          <span className={s.brandDot} />
          <span className={s.brandTitle}>Wedstrijd bijhouden</span>
          <span className={s.brandSub}>eerste tot {WIN_SCORE} wint</span>
        </div>
        <div className={s.controls}>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={swapSides} title="Wissel kanten (S)">
            <svg className={s.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 4l-4 4 4 4" /><path d="M3 8h14" />
              <path d="M17 20l4-4-4-4" /><path d="M21 16H7" />
            </svg>
            Wissel
          </button>
          <button className={s.btn} onClick={reset} title="Reset wedstrijd (R)">
            <svg className={s.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className={s.stage}>
        <SidePanel
          team="red"
          label={teamLabel('red')}
          players={players}
          slots={redSlots}
          setSlots={setRedSlots}
          otherSlots={blueSlots}
        />

        <div className={s.center}>
          <Scoreboard
            team={topTeam}
            label={teamLabel(topTeam)}
            slots={topTeam === 'red' ? redSlots : blueSlots}
            players={players}
            score={scores[topTeam]}
            onAdd={() => addScore(topTeam)}
            onSub={() => subScore(topTeam)}
            isWinner={winner === topTeam}
            popKey={popKey[topTeam]}
          />
          <div className={s.tableWrap}>
            <FoosballTable teamAtTop={teamAtTop} />
          </div>
          <Scoreboard
            team={bottomTeam}
            label={teamLabel(bottomTeam)}
            slots={bottomTeam === 'red' ? redSlots : blueSlots}
            players={players}
            score={scores[bottomTeam]}
            onAdd={() => addScore(bottomTeam)}
            onSub={() => subScore(bottomTeam)}
            isWinner={winner === bottomTeam}
            popKey={popKey[bottomTeam]}
          />
        </div>

        <SidePanel
          team="blue"
          label={teamLabel('blue')}
          players={players}
          slots={blueSlots}
          setSlots={setBlueSlots}
          otherSlots={redSlots}
        />
      </div>

      {/* Keyboard hints */}
      {!winner && (
        <div className={s.footer}>
          <div className={s.hint}>
            <span><span className={s.key}>Q</span>/<span className={s.key}>A</span> Rood ±</span>
            <span><span className={s.key}>P</span>/<span className={s.key}>L</span> Blauw ±</span>
            <span><span className={s.key}>S</span> Wissel</span>
            <span><span className={s.key}>R</span> Reset</span>
          </div>
          <span>Klik op de score voor een doelpunt</span>
        </div>
      )}

      {/* Save section — shown when winner is decided */}
      {winner && (
        <div className={s.saveSection}>
          <div className={s.saveSectionTitle}>
            ★ Team {teamLabel(winner)} wint!
            {isCrawl && <span style={{ color: '#f97316', marginLeft: 8 }}>🐛 Iemand kruipt!</span>}
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notities (optioneel) — bijv. Finale van de dag"
            className={s.notesInput}
          />
          <div className={s.saveRow}>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={saveMatch} disabled={saving}>
              {saving ? 'Opslaan…' : 'Wedstrijd opslaan'}
            </button>
            <button className={`${s.btn} ${s.btnGhost}`} onClick={reset}>
              Reset &amp; opnieuw
            </button>
            {saveError && <span className={s.saveError}>{saveError}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
