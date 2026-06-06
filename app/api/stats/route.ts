import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = getDb();
  const [overall, byPosition, keeperGoals, crawls] = await Promise.all([
    sql`
      SELECT
        p.id,
        p.name,
        COUNT(DISTINCT mp.match_id) AS total_matches,
        SUM(CASE
          WHEN mp.team = 1 AND m.team1_score > m.team2_score THEN 1
          WHEN mp.team = 2 AND m.team2_score > m.team1_score THEN 1
          ELSE 0
        END) AS wins,
        SUM(CASE
          WHEN mp.team = 1 AND m.team1_score < m.team2_score THEN 1
          WHEN mp.team = 2 AND m.team2_score < m.team1_score THEN 1
          ELSE 0
        END) AS losses,
        SUM(CASE
          WHEN m.team1_score = m.team2_score THEN 1
          ELSE 0
        END) AS draws
      FROM players p
      LEFT JOIN match_players mp ON mp.player_id = p.id
      LEFT JOIN matches m ON m.id = mp.match_id
      GROUP BY p.id, p.name
      ORDER BY
        CASE WHEN COUNT(DISTINCT mp.match_id) = 0 THEN 1 ELSE 0 END,
        (SUM(CASE
          WHEN mp.team = 1 AND m.team1_score > m.team2_score THEN 1
          WHEN mp.team = 2 AND m.team2_score > m.team1_score THEN 1
          ELSE 0
        END)::float / NULLIF(COUNT(DISTINCT mp.match_id), 0)) DESC NULLS LAST
    `,

    sql`
      SELECT
        p.id,
        p.name,
        mp.position,
        COUNT(DISTINCT mp.match_id) AS total_matches,
        SUM(CASE
          WHEN mp.team = 1 AND m.team1_score > m.team2_score THEN 1
          WHEN mp.team = 2 AND m.team2_score > m.team1_score THEN 1
          ELSE 0
        END) AS wins,
        SUM(CASE
          WHEN mp.team = 1 AND m.team1_score < m.team2_score THEN 1
          WHEN mp.team = 2 AND m.team2_score < m.team1_score THEN 1
          ELSE 0
        END) AS losses
      FROM players p
      JOIN match_players mp ON mp.player_id = p.id
      JOIN matches m ON m.id = mp.match_id
      GROUP BY p.id, p.name, mp.position
      ORDER BY p.name, mp.position
    `,

    sql`
      SELECT
        p.id,
        p.name,
        COALESCE(SUM(mp.keeper_goals), 0) AS total_keeper_goals,
        COUNT(DISTINCT CASE WHEN mp.position = 'goalkeeper' THEN mp.match_id END) AS gk_matches
      FROM players p
      LEFT JOIN match_players mp ON mp.player_id = p.id AND mp.position = 'goalkeeper'
      GROUP BY p.id, p.name
      ORDER BY total_keeper_goals DESC
    `,

    sql`
      SELECT
        p.id,
        p.name,
        COUNT(*) AS crawl_count
      FROM players p
      JOIN match_players mp ON mp.player_id = p.id
      JOIN matches m ON m.id = mp.match_id
      WHERE (
        (mp.team = 1 AND m.team1_score = 0 AND m.team2_score = 10)
        OR
        (mp.team = 2 AND m.team2_score = 0 AND m.team1_score = 10)
      )
      AND (
        SELECT COUNT(*) FROM match_players mp2
        WHERE mp2.match_id = m.id AND mp2.team = mp.team
      ) <= 2
      GROUP BY p.id, p.name
      ORDER BY crawl_count DESC
    `,
  ]);

  return NextResponse.json({ overall, byPosition, keeperGoals, crawls });
}
