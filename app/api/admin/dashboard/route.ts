export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
import os from 'os';

type CountRow = { count: bigint | number };

async function getUserCounts() {
  try {
    const [totalUsers, totalTalent, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TALENT' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return { totalUsers, totalTalent, adminCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Some local/dev DBs have role as text and not a PostgreSQL enum type.
    if (!message.includes('type "public.UserRole" does not exist')) {
      throw error;
    }

    const [totalRows, talentRows, adminRows] = await Promise.all([
      prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS count FROM "User"`,
      prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS count FROM "User" WHERE UPPER("role"::text) = 'TALENT'`,
      prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS count FROM "User" WHERE UPPER("role"::text) = 'ADMIN'`,
    ]);

    const toNumber = (value: bigint | number | undefined) => Number(value ?? 0);

    return {
      totalUsers: toNumber(totalRows[0]?.count),
      totalTalent: toNumber(talentRows[0]?.count),
      adminCount: toNumber(adminRows[0]?.count),
    };
  }
}

async function handler(request: NextRequest) {
  try {
    // Get counts for different user types
    const { totalUsers, totalTalent, adminCount } = await getUserCounts();

    // Get talent profile statistics
    const [totalProfiles, completeProfiles] = await Promise.all([
      prisma.talentProfile.count(),
      prisma.talentProfile.count({ where: { profileComplete: true } }),
    ]);

    // Get category statistics
    const totalCategories = await prisma.talentCategory.count();
    const totalSubcategories = await prisma.talentSubcategory.count();

    // Get total profile views and likes
    const profileStats = await prisma.talentProfile.aggregate({
      _sum: {
        viewCount: true,
        likeCount: true,
      },
    });

    // Get pending reports count
    const pendingReports = await prisma.contentReport.count({
      where: { status: 'PENDING' },
    });

    // Get recent activity (last 10 activities)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentActivity = recentUsers.map(user => ({
      id: `user-${user.id}`,
      type: 'user' as const,
      message: `New ${user.role.toLowerCase()} registered: ${user.name}`,
      timestamp: user.createdAt,
    }));

    // Calculate system health metrics (real data)
    const loadAvg = os.loadavg();
    const cpuLoad = Math.min(Math.round((loadAvg[0] / os.cpus().length) * 100), 100);
    const memoryUsage = Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100);
    
    // DB Connection check (simple ping)
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const systemHealth = {
      cpuLoad,
      memoryUsage,
      dbLatency,
      status: dbLatency < 100 && cpuLoad < 80 ? 'Optimal' : dbLatency < 500 ? 'Warning' : 'Critical',
      version: 'v2.5.0-stable',
      nodeVersion: process.version,
      platform: os.platform(),
      uptime: Math.round(os.uptime() / 3600), // hours
    };

    // Geo distribution from TalentProfile locations
    const profiles = await prisma.talentProfile.findMany({
      where: { location: { not: null } },
      select: { location: true },
    });
    
    const geoDistribution: Record<string, number> = {};
    for (const p of profiles) {
      if (p.location) {
        const loc = p.location.trim();
        geoDistribution[loc] = (geoDistribution[loc] || 0) + 1;
      }
    }
    
    // Sort by count and take top 10
    const topLocations = Object.entries(geoDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }));

    const stats = {
      totalUsers,
      totalTalent,
      adminCount,
      totalProfiles,
      completeProfiles,
      totalCategories,
      totalSubcategories,
      totalViews: profileStats._sum.viewCount || 0,
      totalLikes: profileStats._sum.likeCount || 0,
      pendingReports,
    };

    return NextResponse.json({
      success: true,
      stats,
      recentActivity,
      systemHealth,
      topLocations,
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
