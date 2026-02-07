import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Track search appearance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talentProfileId, searchQuery, searchFilters, position, clicked } = body;

    if (!talentProfileId || !searchQuery) {
      return NextResponse.json(
        { error: 'talentProfileId and searchQuery are required' },
        { status: 400 }
      );
    }

    // Create search appearance record
    await prisma.searchAppearance.create({
      data: {
        talentProfileId,
        searchQuery,
        searchFilters: searchFilters || null,
        position: position || 0,
        clicked: clicked || false,
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.profileStats.upsert({
      where: {
        talentProfileId_date: {
          talentProfileId,
          date: today,
        },
      },
      create: {
        talentProfileId,
        date: today,
        searchImpressions: 1,
        searchClicks: clicked ? 1 : 0,
      },
      update: {
        searchImpressions: {
          increment: 1,
        },
        ...(clicked && {
          searchClicks: {
            increment: 1,
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Search appearance tracked',
    });
  } catch (error) {
    console.error('Search appearance tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track search appearance' },
      { status: 500 }
    );
  }
}
