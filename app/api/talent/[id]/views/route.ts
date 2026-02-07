import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();
  const id = params.id;

  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to find the talent profile
    let talent = await prisma.talentProfile.findUnique({
      where: { id },
      select: { id: true }
    });

    // If not found by profileId, try by userId
    if (!talent) {
      talent = await prisma.talentProfile.findUnique({
        where: { userId: id },
        select: { id: true }
      });
    }

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
          talentProfileId: talent.id,
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
