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

    // Get user's talent profile
    const talentProfile = await prisma.talentProfile.findUnique({
      where: { userId },
      select: { userId: true }
    });

    if (!talentProfile) {
      return NextResponse.json({ 
        topPerformers: [],
        totalViews: 0,
        totalLikes: 0
      });
    }

    // Get all portfolio items with their engagement stats
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        talentProfileId: (talentProfile as any).userId ?? talentProfile.userId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        mediaUrl: true,
        thumbnail: true,
        likeCount: true,
        createdAt: true,
        _count: {
          select: {
            views: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate performance metrics for each item
    const itemsWithMetrics = portfolioItems.map(item => {
      const views = item._count.views;
      const likes = item.likeCount;
      const engagementRate = views > 0 ? (likes / views) * 100 : 0;
      const daysOld = Math.max(1, Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      const viewsPerDay = views / daysOld;
      
      return {
        id: item.id,
        title: item.title,
        type: item.type,
        mediaUrl: item.mediaUrl,
        thumbnail: item.thumbnail,
        views,
        likeCount: likes,
        engagementRate: Math.round(engagementRate * 10) / 10,
        viewsPerDay: Math.round(viewsPerDay * 10) / 10,
        createdAt: item.createdAt,
      };
    });

    // Sort by engagement rate and get top 5
    const topPerformers = [...itemsWithMetrics]
      .sort((a, b) => {
        // Primary: engagement rate
        if (b.engagementRate !== a.engagementRate) {
          return b.engagementRate - a.engagementRate;
        }
        // Secondary: total views
        return b.views - a.views;
      })
      .slice(0, 5);

    // Calculate totals
    const totalViews = itemsWithMetrics.reduce((sum, item) => sum + item.views, 0);
    const totalLikes = itemsWithMetrics.reduce((sum, item) => sum + item.likeCount, 0);
    const avgEngagementRate = itemsWithMetrics.length > 0
      ? itemsWithMetrics.reduce((sum, item) => sum + item.engagementRate, 0) / itemsWithMetrics.length
      : 0;

    // Get recent performance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Count recent portfolio views (uses `PortfolioView` model)
    const recentViews = await prisma.portfolioView.count({
      where: {
        portfolioItem: {
          talentProfileId: (talentProfile as any).userId ?? talentProfile.userId,
        },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // There isn't a separate PortfolioItemLike model; `likes` is stored on PortfolioItem.
    // Approximate recent likes by summing the `likes` field for items created in the last 7 days.
    const likesAgg = await prisma.portfolioItem.aggregate({
      _sum: { likeCount: true },
      where: {
        talentProfileId: (talentProfile as any).userId ?? talentProfile.userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const recentLikes = (likesAgg._sum?.likeCount as number) || 0;

    return NextResponse.json({
      success: true,
      topPerformers,
      analytics: {
        totalViews,
        totalLikes,
        avgEngagementRate: Math.round(avgEngagementRate * 10) / 10,
        totalItems: itemsWithMetrics.length,
        recentViews,
        recentLikes,
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio performance' },
      { status: 500 }
    );
  }
}
