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

    // Get all liked (saved) talent profiles for the user
    const savedTalents = await prisma.profileLike.findMany({
      where: { userId },
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
            }
            ,
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
    const talents = savedTalents.map(like => ({
      id: (like.talentProfile as any).userId ?? like.talentProfile.userId,
      name: like.talentProfile.user.name || 'Unknown',
      location: like.talentProfile.location || 'Unknown',
      // rating removed per platform decision
      imageUrl: like.talentProfile.avatarUrl,
      bio: like.talentProfile.bio,
      savedAt: like.createdAt,
      categoryId: like.talentProfile.categoryId || null,
      category: like.talentProfile.category?.name || null,
      mediaItems: (like.talentProfile.portfolio || []).map(p => ({
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
    console.error('Failed to fetch saved talents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved talents' },
      { status: 500 }
    );
  }
}
