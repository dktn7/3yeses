import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);
    // Minimal ingest: log server-side and acknowledge. A real implementation
    // should validate, batch and store events in a queue or analytics store.
    // eslint-disable-next-line no-console
    console.log('[analytics/ingest]', payload);
    return NextResponse.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Analytics ingest error', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
