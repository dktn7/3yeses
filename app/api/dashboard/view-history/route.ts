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
    const talents = viewedProfiles.map(view => ({
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
        type: p.type as unknown as string,
        thumbnail: p.thumbnail || undefined,
      }))
    }));

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
