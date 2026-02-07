export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

async function handler(request: NextRequest) {
  try {
    // Get counts for different user types
    const [totalUsers, totalTalent, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TALENT' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get talent profile statistics
    const [totalProfiles, availableProfiles, verifiedProfiles] = await Promise.all([
      prisma.talentProfile.count(),
      prisma.talentProfile.count({ where: { profileComplete: true } }),
      prisma.talentProfile.count({ where: { profileSettings: { is: { isProfilePublic: true } } } }),
    ]);

    // Get review statistics
    const reviews = await prisma.review.aggregate({
      _count: true,
      _avg: {
        rating: true,
      },
    });

    // Get category statistics
    const totalCategories = await prisma.category.count();
    const totalSubcategories = await prisma.subcategory.count();

    // Get total profile views and likes
    const profileStats = await prisma.talentProfile.aggregate({
      _sum: {
        viewCount: true,
        likeCount: true,
      },
    });

    // Get recent activity (last 10 activities)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        createdAt: true,
        reviewer: {
          select: { name: true },
        },
        talentProfile: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    const recentActivity = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user' as const,
        message: `New ${user.role.toLowerCase()} registered: ${user.name}`,
        timestamp: user.createdAt,
      })),
      ...recentReviews.map(review => ({
        id: `review-${review.id}`,
        type: 'review' as const,
        message: `${review.reviewer.name} rated ${review.talentProfile?.user.name || 'talent'} ${review.rating} stars`,
        timestamp: review.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    const stats = {
      totalUsers,
      activeUsers,
      totalTalent,
      adminCount,
      totalProfiles,
      availableProfiles,
      verifiedProfiles,
      totalReviews: reviews._count,
      averageRating: reviews._avg.rating || 0,
      totalCategories,
      totalSubcategories,
      totalViews: profileStats._sum.viewCount || 0,
      totalLikes: profileStats._sum.likeCount || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
