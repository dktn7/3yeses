import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing while Prisma client generation issues are resolved
const mockLikes: { [key: string]: { count: number; userLikes: Set<string> } } = {};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: talentProfileId } = await params;
    
    // TODO: Get actual user ID from session
    const mockUserId = 'user_demo_12345';

    // Initialize mock data if not exists
    if (!mockLikes[talentProfileId]) {
      mockLikes[talentProfileId] = {
        count: 0,
        userLikes: new Set(),
      };
    }

    const talent = mockLikes[talentProfileId];
    const isCurrentlyLiked = talent.userLikes.has(mockUserId);

    // Toggle like status
    if (isCurrentlyLiked) {
      talent.userLikes.delete(mockUserId);
      talent.count = Math.max(0, talent.count - 1);
    } else {
      talent.userLikes.add(mockUserId);
      talent.count += 1;
    }

    return NextResponse.json({
      success: true,
      isLiked: !isCurrentlyLiked,
      likeCount: talent.count,
      message: isCurrentlyLiked ? 'Like removed' : 'Like added',
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: talentProfileId } = await params;
    
    // TODO: Get actual user ID from session
    const mockUserId = 'user_demo_12345';

    // Initialize mock data if not exists
    if (!mockLikes[talentProfileId]) {
      mockLikes[talentProfileId] = {
        count: 0,
        userLikes: new Set(),
      };
    }

    const talent = mockLikes[talentProfileId];
    const isLiked = talent.userLikes.has(mockUserId);

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount: talent.count,
    });

  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
