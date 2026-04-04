import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportStatus, ReportType } from '@prisma/client';
import { createAuditLog } from '@/lib/admin/audit';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

export async function GET(request: Request) {
  // Verify admin auth to get user ID for audit log
  const authResult = await verifyAdminAuth(request as any);
  if (authResult instanceof NextResponse) return authResult;
  const adminUser = authResult.user;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ReportStatus | 'all' || 'all';
    const type = searchParams.get('type') as ReportType | 'all' || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'all') where.status = status;
    if (type !== 'all') where.type = type;

    // Audit logging: Viewed reports
    await createAuditLog({
      action: 'VIEW_REPORTS',
      userId: adminUser.userId,
      details: { page, limit, status, type }
    });

    const [reports, total] = await Promise.all([
      prisma.contentReport.findMany({
        where,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              talentProfile: { select: { avatarUrl: true } }
            }
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              talentProfile: { select: { avatarUrl: true } }
            }
          },
          reportedProfile: {
            select: { userId: true, performerTitle: true, avatarUrl: true }
          },
          portfolioItem: {
            select: { id: true, title: true, type: true, mediaUrl: true, thumbnail: true }
          },
          comment: {
            select: { id: true, content: true }
          },
          handler: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contentReport.count({ where })
    ]);

    // Summary stats
    const [pendingCount, resolvedTodayCount, criticalCount] = await Promise.all([
      prisma.contentReport.count({ where: { status: 'PENDING' } }),
      prisma.contentReport.count({ 
        where: { 
          status: 'RESOLVED',
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        } 
      }),
      prisma.contentReport.count({ 
        where: { 
          type: { in: ['HARASSMENT', 'INAPPROPRIATE_CONTENT'] },
          status: 'PENDING'
        } 
      })
    ]);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      },
      stats: {
        pending: pendingCount,
        resolvedToday: resolvedTodayCount,
        critical: criticalCount
      }
    });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Verify admin auth to get user ID for audit log
    const authResult = await verifyAdminAuth(request as any);
    if (authResult instanceof NextResponse) return authResult;
    const adminUser = authResult.user;

    const body = await request.json();
    const { reportId, status, resolution, handlerId } = body;

    const previousReport = await prisma.contentReport.findUnique({
      where: { id: reportId },
      select: { status: true }
    });

    const updatedReport = await prisma.contentReport.update({
      where: { id: reportId },
      data: {
        status,
        resolution,
        handlerId,
        updatedAt: new Date()
      }
    });

    // Audit logging: Updated report
    await createAuditLog({
      action: 'UPDATE_REPORT',
      userId: adminUser.userId,
      details: {
        reportId,
        previousStatus: previousReport?.status,
        newStatus: status,
        resolution
      }
    });

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error('Failed to update report:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
