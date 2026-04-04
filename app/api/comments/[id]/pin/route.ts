import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';

// Pin/unpin a comment (media owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Authenticate
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Look up comment with its portfolio item
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        isPinned: true,
        portfolioItemId: true,
        talentProfileId: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Determine the media owner
    let mediaOwnerId: string | null = null;

    if (comment.portfolioItemId) {
      const portfolioItem = await prisma.portfolioItem.findUnique({
        where: { id: comment.portfolioItemId },
        select: { talentProfileId: true },
      });
      mediaOwnerId = portfolioItem?.talentProfileId || null;
    } else if (comment.talentProfileId) {
      // Comment is on a talent profile — the profile owner can pin
      mediaOwnerId = comment.talentProfileId;
    }

    // Only the media owner can pin/unpin
    if (decoded.userId !== mediaOwnerId) {
      return NextResponse.json(
        { error: 'Only the media owner can pin comments' },
        { status: 403 }
      );
    }

    // Toggle pin state
    const newPinState = !comment.isPinned;

    await prisma.comment.update({
      where: { id },
      data: {
        isPinned: newPinState,
        pinnedAt: newPinState ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      isPinned: newPinState,
      message: newPinState ? 'Comment pinned' : 'Comment unpinned',
    });
  } catch (error) {
    console.error('Comment pin error:', error);
    return NextResponse.json(
      { error: 'Failed to pin comment' },
      { status: 500 }
    );
  }
}
