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
    const requestedTimeZone = req.nextUrl.searchParams.get('timeZone') || 'UTC';
    let timeZone = 'UTC';
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: requestedTimeZone }).format();
      timeZone = requestedTimeZone;
    } catch {
      // Keep the endpoint deterministic if a browser sends an invalid zone.
    }

    // Get all viewed talent profiles for the user
    const viewedProfiles = await prisma.profileView.findMany({
      where: { viewerId: userId },
      include: {
        talentProfile: {
          select: {
          userId: true,
            bio: true,
            location: true,
            avatarUrl: true,
            categoryId: true,
            category: {
              select: { id: true, name: true }
            },
            user: {
              select: {
                id: true,
                name: true,
              }
            },
            portfolio: {
              select: {
                id: true,
                title: true,
                mediaUrl: true,
                type: true,
                thumbnail: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match expected format
    const historyEntries = viewedProfiles.map(view => ({
      viewId: view.id,
      id: (view.talentProfile as any).userId ?? view.talentProfile.userId,
      name: view.talentProfile.user.name || 'Unknown',
      location: view.talentProfile.location || 'Unknown',
      // rating removed per platform decision
      imageUrl: view.talentProfile.avatarUrl,
      bio: view.talentProfile.bio,
      viewedAt: view.createdAt,
      categoryId: view.talentProfile.categoryId || null,
      category: view.talentProfile.category?.name || null,
      mediaItems: (view.talentProfile.portfolio || []).map(p => ({
        id: p.id,
        title: p.title,
        mediaUrl: p.mediaUrl,
        type: String(p.type || 'IMAGE').toUpperCase(),
        thumbnail: p.thumbnail || undefined,
      })),
      viewedDay: new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(view.createdAt),
    }));

    // Keep the latest visit for each talent on each viewer-local calendar day.
    // Analytics still receives every raw ProfileView event separately.
    const seenDays = new Set<string>();
    const talents = historyEntries.filter((entry) => {
      const key = `${entry.id}:${entry.viewedDay}`;
      if (seenDays.has(key)) return false;
      seenDays.add(key);
      return true;
    });

    return NextResponse.json({
      success: true,
      talents,
      count: talents.length
    });
  } catch (error) {
    console.error('Failed to fetch view history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch view history' },
      { status: 500 }
    );
  }
}
