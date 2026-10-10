export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';

// GET analytics for talent profile
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    // Get user's talent profile
    const talentProfile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedDays = Number.parseInt(searchParams.get('days') || '30', 10);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const priorStartDate = new Date(startDate);
    priorStartDate.setDate(priorStartDate.getDate() - days);
    const profileId = talentProfile.userId;

    // Get daily stats
    const dailyStats = await prisma.profileStats.findMany({
      where: {
        talentProfileId: profileId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get total stats
    const totalViews = await prisma.profileView.count({ where: { talentProfileId: profileId } });
    const periodViews = await prisma.profileView.count({ where: { talentProfileId: profileId, createdAt: { gte: startDate, lte: endDate } } });
    const priorViews = await prisma.profileView.count({ where: { talentProfileId: profileId, createdAt: { gte: priorStartDate, lt: startDate } } });

    const periodUniqueViewers = await prisma.profileView.groupBy({
      by: ['viewerId'],
      where: { talentProfileId: profileId, viewerId: { not: null }, createdAt: { gte: startDate, lte: endDate } },
    });

    const totalPortfolioViews = await prisma.portfolioView.count({
      where: {
        portfolioItem: {
          talentProfileId: profileId,
        },
      },
    });
    const periodPortfolioViews = await prisma.portfolioView.count({ where: { portfolioItem: { talentProfileId: profileId }, createdAt: { gte: startDate, lte: endDate } } });
    const priorPortfolioViews = await prisma.portfolioView.count({ where: { portfolioItem: { talentProfileId: profileId }, createdAt: { gte: priorStartDate, lt: startDate } } });

    const periodSearchImpressions = await prisma.searchAppearance.count({ where: { talentProfileId: profileId, createdAt: { gte: startDate, lte: endDate } } });
    const periodSearchClicks = await prisma.searchAppearance.count({ where: { talentProfileId: profileId, clicked: true, createdAt: { gte: startDate, lte: endDate } } });

    // Get top portfolio items by views
    const topPortfolioItems = await prisma.portfolioItem.findMany({
      where: { talentProfileId: profileId },
      include: {
        _count: {
          select: { views: true },
        },
      },
      orderBy: {
        views: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get recent views (last 10)
    const recentViews = await prisma.profileView.findMany({
      where: { talentProfileId: profileId },
      select: {
        id: true,
        createdAt: true,
        viewer: {
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
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate engagement rate
    const engagementRate = periodViews > 0
      ? ((periodPortfolioViews + talentProfile.likeCount + (await prisma.comment.count({ where: { talentProfileId: profileId } }))) / periodViews) * 100
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalViews: periodViews,
          uniqueViewers: periodUniqueViewers.length,
          totalPortfolioViews: periodPortfolioViews,
          totalLikes: talentProfile.likeCount,
          searchImpressions: periodSearchImpressions,
          searchClicks: periodSearchClicks,
          searchCTR: periodSearchImpressions > 0 ? (periodSearchClicks / periodSearchImpressions) * 100 : 0,
          engagementRate: engagementRate.toFixed(2),
          lifetime: { totalViews, totalPortfolioViews },
        },
        dailyStats: dailyStats.filter((stat) => new Date(stat.date) >= startDate),
        topPortfolioItems,
        recentViews,
        period: {
          days,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          comparison: {
            profileViews: priorViews,
            portfolioViews: priorPortfolioViews,
            profileViewsDelta: periodViews - priorViews,
            portfolioViewsDelta: periodPortfolioViews - priorPortfolioViews,
          },
        },
      },
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
