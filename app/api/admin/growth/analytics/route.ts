
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth/middleware";

async function requireAdmin(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.authenticated || !auth.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (auth.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: auth.user };
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d

    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") startDate.setDate(endDate.getDate() - 7);
    else if (period === "90d") startDate.setDate(endDate.getDate() - 90);
    else startDate.setDate(endDate.getDate() - 30);

    // 1. User Growth
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        }
      },
      _count: {
        id: true,
      },
    });

    // 2. Profile Views (Aggregate)
    const profileViews = await prisma.profileView.count({
      where: {
        createdAt: {
          gte: startDate,
        }
      }
    });

    // 3. Subscription Stats
    const subscriptions = await prisma.subscription.groupBy({
      by: ['plan', 'status'],
      _count: {
        id: true
      }
    });

    // 4. Recent Activity
    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // 5. Top Talents by Views
    const topTalents = await prisma.talentProfile.findMany({
      take: 5,
      orderBy: { viewCount: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({
      period,
      stats: {
        totalUsers: await prisma.user.count(),
        totalTalents: await prisma.talentProfile.count(),
        activeSubscriptions: await prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        periodProfileViews: profileViews,
      },
      charts: {
        userGrowth: processUserGrowth(userGrowth), 
        subscriptions,
      },
      topTalents,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

function processUserGrowth(data: any[]) {
    // Basic processing to group by day. 
    // In a real app, might want to fill in missing days with 0.
    const grouped: Record<string, number> = {};
    
    data.forEach(item => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + item._count.id;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}
