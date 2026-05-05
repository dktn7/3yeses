import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';
import type { ReportType } from '@prisma/client';

// Map FlagButton categories to Prisma ReportType enum
const CATEGORY_TO_REPORT_TYPE: Record<string, ReportType> = {
  nsfw: 'INAPPROPRIATE_CONTENT',
  violence: 'INAPPROPRIATE_CONTENT',
  hate: 'HARASSMENT',
  harassment: 'HARASSMENT',
  spam: 'SPAM',
  copyright: 'COPYRIGHT',
  misinformation: 'OTHER',
  other: 'OTHER',
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, contentType, reason, category } = body;

    if (!contentId || !category) {
      return NextResponse.json(
        { error: 'contentId and category are required' },
        { status: 400 }
      );
    }

    const reportType = CATEGORY_TO_REPORT_TYPE[category];
    if (!reportType) {
      return NextResponse.json(
        { error: 'Invalid report category' },
        { status: 400 }
      );
    }

    // Look up the portfolio item to find the owner
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: contentId },
      select: {
        id: true,
        talentProfileId: true,
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Prevent self-reporting
    if (portfolioItem.talentProfileId === decoded.userId) {
      return NextResponse.json(
        { error: 'You cannot report your own content' },
        { status: 400 }
      );
    }

    // Check for duplicate report from the same user on the same item
    const existingReport = await prisma.contentReport.findFirst({
      where: {
        reportedById: decoded.userId,
        portfolioItemId: contentId,
        status: 'PENDING',
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 409 }
      );
    }

    // Create the report
    const report = await prisma.contentReport.create({
      data: {
        reportedById: decoded.userId,
        reportedProfileId: portfolioItem.talentProfileId,
        portfolioItemId: portfolioItem.id,
        reportedUserId: portfolioItem.talentProfileId,
        type: reportType,
        reason: reason?.trim() || `Reported as: ${category}`,
      },
    });

    // Create a notification for the content owner (media flag event)
    await prisma.talentNotification.create({
      data: {
        talentProfileId: portfolioItem.talentProfileId,
        type: 'SYSTEM',
        title: 'Your content was flagged',
        message: `Your media has been flagged for ${reportType.toLowerCase().replace('_', ' ')}. The moderation team will review it shortly.`,
        metadata: { reportId: report.id, portfolioItemId: portfolioItem.id },
        read: false,
        dismissed: false,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('Moderation report error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
