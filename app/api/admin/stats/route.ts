import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthenticatedUser } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: Request, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const startTime = Date.now();

    // Database statistics
    const [
      totalUsers,
      totalTalent,
      totalClients,
      totalCategories,
      totalSubcategories,
      totalBookings,
      totalReviews,
      recentUsers,
      pendingBookings,
      averageRating
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TALENT' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.category.count(),
      prisma.subcategory.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      })
    ]);

    // Calculate database query time
    const dbQueryTime = Date.now() - startTime;

    // Get system uptime (server process uptime)
    const uptime = process.uptime();

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // Performance metrics
    const performanceMetrics = {
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime)
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
      },
      database: {
        queryTime: dbQueryTime,
        status: getQueryStatus(dbQueryTime)
      },
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    // Business metrics
    const businessMetrics = {
      users: {
        total: totalUsers,
        talent: totalTalent,
        clients: totalClients,
        newThisWeek: recentUsers
      },
      content: {
        categories: totalCategories,
        subcategories: totalSubcategories
      },
      activity: {
        totalBookings,
        pendingBookings,
        totalReviews,
        averageRating: averageRating._avg.rating ? Number(averageRating._avg.rating.toFixed(1)) : 0
      }
    };

    return NextResponse.json({
      performance: performanceMetrics,
      business: businessMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getQueryStatus(queryTime: number): string {
  if (queryTime < 1000) return 'excellent';
  if (queryTime < 3000) return 'good';
  return 'slow';
}

function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export const GET = withAuth(handler);
