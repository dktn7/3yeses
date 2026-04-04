import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Track profile view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { talentProfileId, userId, referrer, duration } = body;

    if (!talentProfileId) {
      return NextResponse.json(
        { error: 'talentProfileId is required' },
        { status: 400 }
      );
    }

    // If viewer is the profile owner, do not count the view
    if (userId) {
      const profileOwner = await prisma.talentProfile.findUnique({
        where: { userId: talentProfileId },
        select: { userId: true }
      });

      if (profileOwner?.userId === userId) {
        return NextResponse.json({
          success: true,
          message: 'Own profile view ignored',
        });
      }
    }

    // Extract IP address and user agent from request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create profile view record
    await prisma.profileView.create({
      data: {
        talentProfileId,
        viewerId: userId || null,
        ipAddress,
        userAgent,
        referrer,
        duration,
      },
    });

    // Increment talent profile view count
    await prisma.talentProfile.update({
      where: { userId: talentProfileId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.profileStats.upsert({
      where: {
        talentProfileId_date: {
          talentProfileId,
          date: today,
        },
      },
      create: {
        talentProfileId,
        date: today,
        views: 1,
        uniqueViews: userId ? 1 : 0,
      },
      update: {
        views: {
          increment: 1,
        },
        ...(userId && {
          uniqueViews: {
            increment: 1,
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile view tracked',
    });
  } catch (error) {
    console.error('Profile view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track profile view' },
      { status: 500 }
    );
  }
}
