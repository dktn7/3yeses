// Messages API
// GET /api/messages - Get user's messages (authenticated)
// POST /api/messages - Send new message (authenticated)

import { NextRequest, NextResponse } from 'next/server';

// Messaging feature is not currently implemented in the Prisma schema.
// Return a 501 Not Implemented until a Message model exists or the feature is implemented.

export async function GET(_request: NextRequest) {
  return NextResponse.json({ success: false, message: 'Messaging not implemented' }, { status: 501 });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: false, message: 'Messaging not implemented' }, { status: 501 });
}
