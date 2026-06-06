import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      team1_score INT NOT NULL,
      team2_score INT NOT NULL,
      played_at TIMESTAMP DEFAULT NOW(),
      notes TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS match_players (
      id SERIAL PRIMARY KEY,
      match_id INT REFERENCES matches(id) ON DELETE CASCADE,
      player_id INT REFERENCES players(id),
      team INT NOT NULL CHECK (team IN (1, 2)),
      position VARCHAR(20) NOT NULL CHECK (position IN ('forward', 'goalkeeper')),
      keeper_goals INT DEFAULT 0
    )
  `;
  return NextResponse.json({ ok: true, message: 'Tables created' });
}
