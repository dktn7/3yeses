export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/middleware';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.userId;
    const prisma = getPrisma();

    // Get user with talent profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        talentProfile: {
          select: {
            id: true,
            viewCount: true,
            likeCount: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize stats
    let stats = {
      profileViews: 0,
      profileViewsChange: 0,
      comments: 0,
      commentsChange: 0,
      likes: 0,
      likesChange: 0,
      portfolio: 0,
      portfolioChange: 0,
    };

    // Only fetch data for TALENT users
    if (user.role === 'TALENT' && user.talentProfile) {
      const talentProfileId = user.talentProfile.id;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get profile views from database
      stats.profileViews = user.talentProfile.viewCount || 0;

      // Get views from last 30 days for trend
      const recentViews = await prisma.profileView.count({
        where: {
          talentProfileId,
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const previousViews = await prisma.profileView.count({
        where: {
          talentProfileId,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      });

      stats.profileViewsChange = previousViews > 0 
        ? Math.round(((recentViews - previousViews) / previousViews) * 100)
        : 0;

      // Get total comments on profile
      const totalComments = await prisma.comment.count({
        where: {
          talentProfileId,
          status: 'APPROVED'
        }
      });

      stats.comments = totalComments;

      // Get recent comments for trend
      const recentComments = await prisma.comment.count({
        where: {
          talentProfileId,
          status: 'APPROVED',
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const previousComments = await prisma.comment.count({
        where: {
          talentProfileId,
          status: 'APPROVED',
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      });

      stats.commentsChange = recentComments - previousComments;

      // Get likes from database
      stats.likes = user.talentProfile.likeCount || 0;

      // Get recent likes for trend
      const recentLikes = await prisma.like.count({
        where: {
          talentProfileId,
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      const previousLikes = await prisma.like.count({
        where: {
          talentProfileId,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      });

      stats.likesChange = previousLikes > 0
        ? Math.round(((recentLikes - previousLikes) / previousLikes) * 100)
        : 0;

      // Get portfolio items count (all types: VIDEO, IMAGE, etc.)
      const totalPortfolioItems = await prisma.portfolioItem.count({
        where: {
          talentProfileId
        }
      });

      stats.portfolio = totalPortfolioItems;

      // Portfolio trends - can't calculate by date as PortfolioItem has no createdAt
      stats.portfolioChange = 0;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
