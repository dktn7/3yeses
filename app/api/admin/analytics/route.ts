export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { getPrisma } from '@/lib/prisma';

async function handler(request: NextRequest) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get user growth data
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group users by month
    const userGrowth = users.reduce((acc: any[], user) => {
      const month = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.users++;
      } else {
        acc.push({ month, users: 1 });
      }
      return acc;
    }, []);

    // Get profile growth data
    const profiles = await prisma.talentProfile.findMany({
      where: {
        user: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      select: {
        user: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    // Group profiles by month
    const profileGrowth = profiles.reduce((acc: any[], profile) => {
      const month = new Date(profile.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.profiles++;
      } else {
        acc.push({ month, profiles: 1 });
      }
      return acc;
    }, []);

    // Review statistics removed from platform — return empty stats to keep response shape
    const formattedReviewStats: any[] = [];

    // Get top categories by talent count
    const categoryTalent = await prisma.talentProfile.groupBy({
      by: ['categoryId'],
      _count: true,
      where: {
        categoryId: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          categoryId: 'desc',
        },
      },
      take: 5,
    });

    // Get category names
    const categoryIds = categoryTalent.map(c => c.categoryId).filter((id): id is string => id !== null);
    const categories = await prisma.talentCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const formattedTopCategories = categoryTalent.map(cat => {
      const category = categories.find(c => c.id === cat.categoryId);
      return {
        name: category?.name || 'Unknown',
        count: cat._count,
      };
    });

    // Get top talent by views and likes
    const topTalent = await prisma.talentProfile.findMany({
      orderBy: {
        viewCount: 'desc',
      },
      take: 5,
      select: {
        userId: true,
        viewCount: true,
        likeCount: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedTopTalent = topTalent.map((talent) => ({
      name: (talent as any).user?.name || 'Unknown',
      views: (talent as any).viewCount ?? 0,
      likes: (talent as any).likeCount ?? 0,
      id: (talent as any).userId || undefined,
    }));

    const analytics = {
      userGrowth,
      profileGrowth,
      reviewStats: formattedReviewStats,
      topCategories: formattedTopCategories,
      topTalent: formattedTopTalent,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Admin analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
