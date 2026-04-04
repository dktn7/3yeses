export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/middleware';
import { getPrisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.userId;
    const prisma = getPrisma();

    // Get user with talent profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        talentProfile: {
          select: {
            userId: true,
          }
        }
      }
    });

    if (!user || user.role !== 'TALENT' || !user.talentProfile) {
      return NextResponse.json({ activities: [] });
    }

    const talentProfileId = (user.talentProfile as any).userId ?? user.talentProfile.userId;
    const activities: Array<{
      type: 'view' | 'comment' | 'like';
      text: string;
      time: string;
      createdAt: Date;
    }> = [];

    // Get recent profile views (last 10)
    const recentViews = await prisma.profileView.findMany({
      where: { talentProfileId },
      include: {
        viewer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    for (const view of recentViews) {
      activities.push({
        type: 'view',
        text: `${view.viewer?.name || 'Someone'} viewed your profile`,
        time: formatRelativeTime(view.createdAt),
        createdAt: view.createdAt
      });
    }

    // Get recent comments (last 10)
    const recentComments = await prisma.comment.findMany({
      where: {
        OR: [
          { talentProfileId }, // Comments on profile
          { portfolioItem: { talentProfileId } } // Comments on videos
        ],
        status: 'APPROVED'
      },
      include: {
        user: {
          select: { name: true }
        },
        portfolioItem: {
          select: { title: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    for (const comment of recentComments) {
      const userName = comment.user?.name || 'Someone';
      const itemTitle = comment.portfolioItem?.title;
      
      activities.push({
        type: 'comment',
        text: itemTitle 
          ? `${userName} commented on "${itemTitle}"`
          : `${userName} commented on your profile`,
        time: formatRelativeTime(comment.createdAt),
        createdAt: comment.createdAt
      });
    }

    // Get recent likes (last 10)
    const recentLikes = await prisma.profileLike.findMany({
      where: { talentProfileId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    for (const like of recentLikes) {
      activities.push({
        type: 'like',
        text: `${like.user?.name || 'Someone'} liked your profile`,
        time: formatRelativeTime(like.createdAt),
        createdAt: like.createdAt
      });
    }

    // Sort all activities by date and take top 10
    const sortedActivities = activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(({ createdAt, ...rest }) => rest); // Remove createdAt from response

    return NextResponse.json({ activities: sortedActivities });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}
