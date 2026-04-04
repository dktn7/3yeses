import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;

    const item = await prisma.portfolioItem.findUnique({
      where: { id },
      include: {
        talentProfile: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            views: true,
            comments: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get actual view count
    const viewCount = await prisma.portfolioView.count({
      where: { portfolioItemId: item.id },
    });

    // Get likes
    const likeCount = await prisma.profileLike.count({
      where: { talentProfileId: item.talentProfileId },
    });

    const formattedItem = {
      id: item.id,
      title: item.title,
      mediaUrl: item.mediaUrl,
      type: item.type,
      thumbnail: item.thumbnail || undefined,
      talentProfile: {
        id: (item.talentProfile as any).userId ?? (item.talentProfile as any).id,
        user: { name: (item.talentProfile as any).user?.name || 'Unknown' },
        avatarUrl: item.talentProfile.avatarUrl,
        category: item.talentProfile.category,
      },
      views: viewCount,
      likes: likeCount,
      isSponsored: false,
      createdAt: item.createdAt,
    };

    return NextResponse.json(formattedItem);
  } catch (error) {
    console.error('Failed to fetch portfolio item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
