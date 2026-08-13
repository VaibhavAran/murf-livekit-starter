import { NextResponse } from 'next/server';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = path.resolve(process.cwd(), '../backend/data/users.db');

export const revalidate = 0;

export async function GET() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id             TEXT PRIMARY KEY,
        name                TEXT,
        language_preference TEXT,
        current_level       TEXT,
        topics_covered      TEXT DEFAULT '[]',
        common_mistakes     TEXT DEFAULT '[]',
        last_interaction    TEXT
      )
    `);

    const learners = await db.all('SELECT * FROM users ORDER BY last_interaction DESC');
    await db.close();

    return NextResponse.json({
      learners: learners.map((learner) => ({
        ...learner,
        topics_covered: safeJsonList(learner.topics_covered),
        common_mistakes: safeJsonList(learner.common_mistakes),
      })),
    });
  } catch (error) {
    console.error('Error fetching learners:', error);
    return NextResponse.json({ learners: [], error: String(error) }, { status: 500 });
  }
}

function safeJsonList(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
