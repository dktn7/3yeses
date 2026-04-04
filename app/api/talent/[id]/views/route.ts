import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  const prisma = getPrisma();

  if (!id) {
    return NextResponse.json({ error: 'Missing talent id' }, { status: 400 });
  }

  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the talent profile by userId (TalentProfile uses userId as unique key)
    const talent = await prisma.talentProfile.findUnique({
      where: { userId: id },
      select: { userId: true }
    });

    if (!talent) {
      return NextResponse.json(
        { error: 'Talent not found' },
        { status: 404 }
      );
    }

    // Get today's profile stats
    const stats = await prisma.profileStats.findUnique({
      where: {
        talentProfileId_date: {
          talentProfileId: talent.userId,
          date: today,
        },
      },
      select: {
        views: true,
        uniqueViews: true,
      }
    });

    return NextResponse.json({
      viewsToday: stats?.views || 0,
      uniqueViewsToday: stats?.uniqueViews || 0,
    });

  } catch (error) {
    console.error('Error fetching views:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
