import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma();
    const id = params.id;

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
    const likeCount = await prisma.like.count({
      where: { talentProfileId: item.talentProfileId },
    });

    const formattedItem = {
      id: item.id,
      title: item.title,
      url: item.url,
      type: item.type,
      thumbnail: undefined,
      talentProfile: {
        id: item.talentProfile.id,
        user: {
          name: item.talentProfile.user.name,
        },
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
