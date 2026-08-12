import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Resolve database path
const dbPath = path.resolve(process.cwd(), '../backend/data/users.db');

export const revalidate = 0; // Don't cache

export async function GET() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Ensure table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS escalations (
        ticket_id           TEXT PRIMARY KEY,
        user_id             TEXT,
        caller_name         TEXT,
        reason              TEXT,
        urgency             TEXT,
        summary             TEXT,
        preferred_contact   TEXT,
        status              TEXT DEFAULT 'Open',
        created_at          TEXT
      )
    `);

    const escalations = await db.all('SELECT * FROM escalations ORDER BY created_at DESC');
    await db.close();

    return NextResponse.json({ escalations });
  } catch (error) {
    console.error('Error fetching escalations:', error);
    return NextResponse.json({ escalations: [], error: String(error) }, { status: 500 });
  }
}
