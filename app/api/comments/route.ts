import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';

// GET comments for a portfolio item or talent profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioItemId = searchParams.get('portfolioItemId');
    const talentProfileId = searchParams.get('talentProfileId');
    const parentCommentId = searchParams.get('parentCommentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED', // Only show approved comments to public
    };

    if (portfolioItemId) {
      where.portfolioItemId = portfolioItemId;
      where.parentCommentId = null; // Only top-level comments
    } else if (talentProfileId) {
      where.talentProfileId = talentProfileId;
      where.parentCommentId = null;
    } else if (parentCommentId) {
      where.parentCommentId = parentCommentId; // Get replies
    } else {
      return NextResponse.json(
        { error: 'portfolioItemId or talentProfileId required' },
        { status: 400 }
      );
    }

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          content: true,
          likesCount: true,
          isPinned: true,
          pinnedAt: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              talentProfile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    // Check if current user has liked any of these comments
    let likedCommentIds = new Set<string>();
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      try {
        const decoded = await AuthService.verifyJWT(accessToken);
        if (decoded) {
          const commentIds = comments.map((c: any) => c.id);
          const likes = await prisma.commentLike.findMany({
            where: {
              userId: decoded.userId,
              commentId: { in: commentIds },
            },
            select: { commentId: true },
          });
          likedCommentIds = new Set(likes.map((l: any) => l.commentId));
        }
      } catch {
        // Ignore auth errors — treat as anonymous
      }
    }

    const commentsWithLiked = comments.map((c: any) => ({
      ...c,
      isLiked: likedCommentIds.has(c.id),
    }));

    return NextResponse.json({
      success: true,
      comments: commentsWithLiked,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(request: NextRequest) {
  try {
    // Get user from token
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

    const body = await request.json();
    const { content, portfolioItemId, talentProfileId, parentCommentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (!portfolioItemId && !talentProfileId) {
      return NextResponse.json(
        { error: 'portfolioItemId or talentProfileId required' },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: decoded.userId,
        portfolioItemId,
        talentProfileId,
        parentCommentId,
        status: 'APPROVED', // Auto-approve by default (can change to PENDING for moderation)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            talentProfile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Send PROFILE_COMMENT notification to the media/profile owner
    try {
      let ownerId: string | null = null;

      if (portfolioItemId) {
        const item = await prisma.portfolioItem.findUnique({
          where: { id: portfolioItemId },
          select: { talentProfileId: true },
        });
        ownerId = item?.talentProfileId ?? null;
      } else if (talentProfileId) {
        ownerId = talentProfileId;
      }

      // Don't notify if commenter is the content owner
      if (ownerId && ownerId !== decoded.userId) {
        const actor = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { name: true },
        });
        const actorName = actor?.name || 'Someone';
        const truncated = content.trim().length > 60
          ? content.trim().slice(0, 60) + '…'
          : content.trim();

        await prisma.talentNotification.create({
          data: {
            talentProfileId: ownerId,
            type: 'PROFILE_COMMENT',
            title: `${actorName} commented`,
            message: truncated,
            metadata: {
              actorId: decoded.userId,
              commentId: comment.id,
              portfolioItemId: portfolioItemId || null,
            },
          } as any,
        });
      }
    } catch (nerr) {
      console.error('Failed to create comment notification:', nerr);
    }

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment posted successfully',
    });
  } catch (error) {
    console.error('Comment post error:', error);
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}
