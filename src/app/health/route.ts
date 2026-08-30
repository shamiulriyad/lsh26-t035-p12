import { NextResponse } from 'next/server';

/**
 * Liveness probe. Deliberately does NOT import or call Supabase / any DB.
 * Returns 200 even when the database is unreachable.
 *
 * In production the custom server (`server.js`) answers `/health` before this
 * handler is ever reached; this route keeps the probe working under `next dev`
 * and as a defense-in-depth fallback.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' });
}
