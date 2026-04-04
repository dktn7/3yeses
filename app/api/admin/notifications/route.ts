import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

async function getHandler(request: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    // Get admin's lastClearedAt timestamp
    const adminId = context?.admin?.userId;
    let lastClearedAt: Date | null = null;

    if (adminId) {
      const state = await prisma.adminNotificationState.findUnique({
        where: { adminId },
        select: { lastClearedAt: true },
      });
      lastClearedAt = state?.lastClearedAt ?? null;
    }

    // Build date filter
    const dateFilter = lastClearedAt ? { createdAt: { gt: lastClearedAt } } : {};

    // 1. Fetch pending reports (newer than lastClearedAt)
    const pendingReports = await prisma.contentReport.findMany({
      where: {
        status: 'PENDING',
        ...dateFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        reportedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // 2. Fetch pending parental consents (newer than lastClearedAt)
    const pendingConsents = await prisma.user.findMany({
      where: {
        parentalConsentPending: true,
        ...dateFilter,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    const unreadCount = pendingReports.length + pendingConsents.length;

    // For lightweight badge polling, return just the count
    if (countOnly) {
      return NextResponse.json({ unreadCount });
    }

    // Map to unified notification format
    const notifications = [
      ...pendingReports.map((report) => ({
        id: `report-${report.id}`,
        type: 'ALERT' as const,
        title: 'New Content Report',
        message: `${report.reportedBy.name} reported a ${report.type.toLowerCase().replace('_', ' ')}`,
        timestamp: report.createdAt,
        priority: 'high' as const,
        link: '/admin/reports',
      })),
      ...pendingConsents.map((user) => ({
        id: `consent-${user.id}`,
        type: 'SYSTEM' as const,
        title: 'Pending Consent',
        message: `Parental consent pending for ${user.name}`,
        timestamp: user.createdAt,
        priority: 'medium' as const,
        link: `/admin/users?id=${user.id}`,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Failed to fetch admin notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Clear all notifications (sets lastClearedAt to now)
async function postHandler(request: NextRequest, context: any) {
  try {
    const adminId = context?.admin?.userId;
    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID not found' }, { status: 400 });
    }

    await prisma.adminNotificationState.upsert({
      where: { adminId },
      update: { lastClearedAt: new Date() },
      create: { adminId, lastClearedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Notifications cleared' });
  } catch (error) {
    console.error('Failed to clear admin notifications:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
