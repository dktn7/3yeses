import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

async function resolvePortfolioItemId(context: any) {
  const params = (context && context.params) || { id: undefined };
  const resolvedParams = typeof params?.then === 'function' ? await params : params;
  return resolvedParams?.id as string | undefined;
}

export async function GET(request: NextRequest, context: any) {
  const prisma = getPrisma();
  const id = await resolvePortfolioItemId(context);
  if (!id) return NextResponse.json({ success: false, error: 'Missing portfolio item id' }, { status: 400 });

  try {
    const item = await prisma.portfolioItem.findUnique({
      where: { id },
      select: { id: true, likeCount: true },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Portfolio item not found' }, { status: 404 });
    }

    let isLiked = false;
    const auth = await authenticateUser(request);
    if (auth.authenticated && auth.user) {
      const existing = await prisma.portfolioItemLike.findUnique({
        where: {
          userId_portfolioItemId: {
            userId: auth.user.userId,
            portfolioItemId: item.id,
          },
        },
        select: { id: true },
      });
      isLiked = Boolean(existing);
    }

    return NextResponse.json({ success: true, likeCount: item.likeCount || 0, isLiked });
  } catch (error) {
    console.error('Portfolio like status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch like status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: any) {
  const prisma = getPrisma();
  const id = await resolvePortfolioItemId(context);
  if (!id) return NextResponse.json({ success: false, error: 'Missing portfolio item id' }, { status: 400 });

  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { like } = await request.json().catch(() => ({}));
    const likeRequested = Boolean(like);
    const userId = auth.user.userId;

    const item = await prisma.portfolioItem.findUnique({
      where: { id },
      select: { id: true, likeCount: true },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Portfolio item not found' }, { status: 404 });
    }

    const existing = await prisma.portfolioItemLike.findUnique({
      where: {
        userId_portfolioItemId: {
          userId,
          portfolioItemId: item.id,
        },
      },
      select: { id: true },
    });

    if (likeRequested && !existing) {
      await prisma.$transaction([
        prisma.portfolioItemLike.create({
          data: { userId, portfolioItemId: item.id },
        }),
        prisma.portfolioItem.update({
          where: { id: item.id },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
    } else if (!likeRequested && existing) {
      await prisma.$transaction([
        prisma.portfolioItemLike.delete({ where: { id: existing.id } }),
        prisma.portfolioItem.update({
          where: { id: item.id },
          data: { likeCount: { decrement: Math.max(0, item.likeCount || 0) > 0 ? 1 : 0 } },
        }),
      ]);
    }

    const updated = await prisma.portfolioItem.findUnique({
      where: { id: item.id },
      select: { likeCount: true },
    });

    return NextResponse.json({
      success: true,
      likeCount: updated?.likeCount || 0,
      isLiked: likeRequested,
    });
  } catch (error) {
    console.error('Portfolio like error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update like' },
      { status: 500 }
    );
  }
}
