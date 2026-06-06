import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  const players = await sql`SELECT id, name FROM players ORDER BY name`;
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const sql = getDb();
  const [player] = await sql`
    INSERT INTO players (name) VALUES (${name.trim()})
    ON CONFLICT (name) DO NOTHING
    RETURNING id, name
  `;
  if (!player) return NextResponse.json({ error: 'Player already exists' }, { status: 409 });
  return NextResponse.json(player, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const sql = getDb();
  await sql`DELETE FROM players WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
