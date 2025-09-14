import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talentProfileId = params.id;
    
    // TODO: Get actual user ID from session
    const mockUserId = 'user_demo_12345';

    // Get talent profile with like status
    const talentProfile = await prisma.talentProfile.findUnique({
      where: { id: talentProfileId },
      select: {
        likeCount: true,
        likes: {
          where: {
            userId: mockUserId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      likeCount: talentProfile.likeCount,
      isLiked: talentProfile.likes.length > 0,
    });

  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
