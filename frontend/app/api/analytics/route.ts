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

    // Ensure call_logs table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS call_logs (
        call_id             TEXT PRIMARY KEY,
        user_id             TEXT,
        caller_name         TEXT,
        call_type           TEXT,
        duration_seconds    INTEGER,
        exercises_done      INTEGER DEFAULT 0,
        escalation_done     INTEGER DEFAULT 0,
        status              TEXT,
        ended_at            TEXT
      )
    `);

    const totalRow = await db.get('SELECT COUNT(*) as count FROM call_logs');
    const successRow = await db.get("SELECT COUNT(*) as count FROM call_logs WHERE status = 'SUCCESS'");
    const failedRow = await db.get("SELECT COUNT(*) as count FROM call_logs WHERE status = 'FAILED'");

    const total_calls = totalRow?.count || 0;
    const successful_calls = successRow?.count || 0;
    const failed_calls = failedRow?.count || 0;
    const success_rate = total_calls > 0 ? Math.round((successful_calls / total_calls) * 100) : 0;

    const logs = await db.all('SELECT * FROM call_logs ORDER BY ended_at DESC');
    await db.close();

    return NextResponse.json({
      total_calls,
      successful_calls,
      failed_calls,
      success_rate,
      logs: logs || [],
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        total_calls: 0,
        successful_calls: 0,
        failed_calls: 0,
        success_rate: 0,
        logs: [],
        error: String(error),
      },
      { status: 500 }
    );
  }
}
