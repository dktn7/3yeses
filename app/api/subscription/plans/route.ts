import { NextResponse } from 'next/server';
import { PRICING_PLANS } from '@/lib/subscription-config';

export async function GET() {
  return NextResponse.json({
    plans: Object.values(PRICING_PLANS),
  });
}
