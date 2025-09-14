import { NextResponse } from 'next/server';

// Profile settings endpoints require authentication (next-auth). For TS-checking
// in this environment we'll return 401 for unauthenticated access.

export async function GET() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
