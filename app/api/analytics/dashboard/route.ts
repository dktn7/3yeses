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

    const decoded = AuthService.verifyJWT(accessToken);
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
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily stats
    const dailyStats = await prisma.profileStats.findMany({
      where: {
        talentProfileId: talentProfile.id,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get total stats
    const totalViews = await prisma.profileView.count({
      where: { talentProfileId: talentProfile.id },
    });

    const uniqueViewers = await prisma.profileView.groupBy({
      by: ['viewerId'],
      where: {
        talentProfileId: talentProfile.id,
        viewerId: { not: null },
      },
    });

    const totalPortfolioViews = await prisma.portfolioView.count({
      where: {
        portfolioItem: {
          talentProfileId: talentProfile.id,
        },
      },
    });

    const totalSearchImpressions = await prisma.searchAppearance.count({
      where: { talentProfileId: talentProfile.id },
    });

    const totalSearchClicks = await prisma.searchAppearance.count({
      where: {
        talentProfileId: talentProfile.id,
        clicked: true,
      },
    });

    // Get top portfolio items by views
    const topPortfolioItems = await prisma.portfolioItem.findMany({
      where: { talentProfileId: talentProfile.id },
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
      where: { talentProfileId: talentProfile.id },
      include: {
        viewer: {
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
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate engagement rate
    const engagementRate = totalViews > 0
      ? ((totalPortfolioViews + talentProfile.likeCount + (await prisma.comment.count({ where: { talentProfileId: talentProfile.id } }))) / totalViews) * 100
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalViews,
          uniqueViewers: uniqueViewers.length,
          totalPortfolioViews,
          totalLikes: talentProfile.likeCount,
          averageRating: talentProfile.rating,
          searchImpressions: totalSearchImpressions,
          searchClicks: totalSearchClicks,
          searchCTR: totalSearchImpressions > 0 ? (totalSearchClicks / totalSearchImpressions) * 100 : 0,
          engagementRate: engagementRate.toFixed(2),
        },
        dailyStats,
        topPortfolioItems,
        recentViews,
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
