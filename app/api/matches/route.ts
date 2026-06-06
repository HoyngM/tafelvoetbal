import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  const matches = await sql`
    SELECT
      m.id,
      m.team1_score,
      m.team2_score,
      m.played_at,
      m.notes,
      json_agg(
        json_build_object(
          'player_id', mp.player_id,
          'player_name', p.name,
          'team', mp.team,
          'position', mp.position,
          'keeper_goals', mp.keeper_goals
        ) ORDER BY mp.team, mp.position
      ) AS participants
    FROM matches m
    JOIN match_players mp ON mp.match_id = m.id
    JOIN players p ON p.id = mp.player_id
    GROUP BY m.id
    ORDER BY m.played_at DESC
    LIMIT 50
  `;
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { team1_score, team2_score, notes, participants } = body;

  if (
    typeof team1_score !== 'number' ||
    typeof team2_score !== 'number' ||
    !Array.isArray(participants) ||
    participants.length < 2
  ) {
    return NextResponse.json({ error: 'Invalid match data' }, { status: 400 });
  }

  const sql = getDb();
  const [match] = await sql`
    INSERT INTO matches (team1_score, team2_score, notes)
    VALUES (${team1_score}, ${team2_score}, ${notes ?? null})
    RETURNING id
  `;

  for (const p of participants) {
    await sql`
      INSERT INTO match_players (match_id, player_id, team, position, keeper_goals)
      VALUES (${match.id}, ${p.player_id}, ${p.team}, ${p.position}, ${p.keeper_goals ?? 0})
    `;
  }

  return NextResponse.json({ id: match.id }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const sql = getDb();
  await sql`DELETE FROM matches WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
