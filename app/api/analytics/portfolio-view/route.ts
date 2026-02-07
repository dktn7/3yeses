import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Track portfolio item view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioItemId, userId, duration, completed } = body;

    if (!portfolioItemId) {
      return NextResponse.json(
        { error: 'portfolioItemId is required' },
        { status: 400 }
      );
    }

    // Get the portfolio item to find the talent profile
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: portfolioItemId },
      select: { talentProfileId: true },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    // Create portfolio view record
    await prisma.portfolioView.create({
      data: {
        portfolioItemId,
        viewerId: userId || null,
        duration,
        completed: completed || false,
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.profileStats.upsert({
      where: {
        talentProfileId_date: {
          talentProfileId: portfolioItem.talentProfileId,
          date: today,
        },
      },
      create: {
        talentProfileId: portfolioItem.talentProfileId,
        date: today,
        portfolioViews: 1,
      },
      update: {
        portfolioViews: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Portfolio view tracked',
    });
  } catch (error) {
    console.error('Portfolio view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track portfolio view' },
      { status: 500 }
    );
  }
}
