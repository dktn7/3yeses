import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AuthService from '@/lib/auth/auth-service';
import { getPrisma } from '@/lib/prisma';

// GET - Fetch persisted notifications for the authenticated talent profile
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
    }

    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { talentProfile: { select: { userId: true } } },
    });

    const talentProfileId = user?.talentProfile?.userId;
    if (!talentProfileId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 200 });
    }

    const notifications = await prisma.talentNotification.findMany({
      where: { talentProfileId, dismissed: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        metadata: true,
        read: true,
        dismissed: true,
        createdAt: true,
      },
    });

    // Include pending media reports for this talent profile as warning/media-flag notifications
    const mediaReports = await prisma.contentReport.findMany({
      where: {
        reportedUserId: talentProfileId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        portfolioItemId: true,
        type: true,
        reason: true,
        createdAt: true,
      },
    });

    const reportNotifications = mediaReports.map((report) => ({
      id: `report-${report.id}`,
      type: 'media_flag',
      title: 'Content flagged for review',
      message: `Your portfolio item has been reported for ${report.type.toLowerCase().replace('_', ' ')}`,
      metadata: { reportId: report.id, portfolioItemId: report.portfolioItemId },
      timestamp: report.createdAt,
      read: false,
      dismissed: false,
    }));

    const combined = [...notifications.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(),
      title: n.title,
      message: n.message,
      metadata: n.metadata || null,
      timestamp: n.createdAt,
      read: n.read,
      dismissed: n.dismissed,
    })),
      ...reportNotifications,
    ];

    // Sort by timestamp descending
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = combined.filter(n => !n.read).length;

    return NextResponse.json({ notifications: combined, unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Bulk mark notifications as read
export async function POST(request: Request) {
  try {
    const { notificationIds, markAllAsRead } = await request.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { talentProfile: { select: { userId: true } } },
    });
    const talentProfileId = user?.talentProfile?.userId;
    if (!talentProfileId) return NextResponse.json({ message: 'No profile' }, { status: 400 });

    if (markAllAsRead) {
      await prisma.talentNotification.updateMany({
        where: { talentProfileId, dismissed: false },
        data: { read: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      await prisma.talentNotification.updateMany({
        where: { id: { in: notificationIds }, talentProfileId, dismissed: false },
        data: { read: true },
      });
      return NextResponse.json({ message: `${notificationIds.length} notifications marked as read` });
    }

    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
