import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.userId;

    // Get the user's talent profile
    const talentProfile = await prisma.talentProfile.findUnique({
      where: { userId },
      select: { userId: true }
    });

    if (!talentProfile) {
      return NextResponse.json({ 
        items: [],
        message: 'No talent profile found'
      });
    }

    // Fetch portfolio items for this talent
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        talentProfileId: (talentProfile as any).userId ?? talentProfile.userId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        mediaUrl: true,
        thumbnail: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      items: portfolioItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        mediaUrl: item.mediaUrl,
        thumbnail: item.thumbnail,
        createdAt: item.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}
