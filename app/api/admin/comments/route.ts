export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Only show parent comments (not replies) in main list
    where.parentCommentId = null;

    // Get comments with pagination
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          status: true,
          likesCount: true,
          createdAt: true,
          parentCommentId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              talentProfile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          portfolioItem: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          talentProfile: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Admin comments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
