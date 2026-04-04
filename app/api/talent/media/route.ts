export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

// GET - List media for the authenticated talent profile
export async function GET(req: Request) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ media: [] }, { status: 401 });
    }
    const { userId } = auth.user;

    const profile = await prisma.talentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ media: [] }, { status: 200 });
    }
    const profileId = (profile as any).id ?? profile.userId;

    const items = await prisma.portfolioItem.findMany({
      where: { talentProfileId: profileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        mediaUrl: true,
        type: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    const media = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      mediaUrl: item.mediaUrl,
      type: item.type.toLowerCase(),
      thumbnail: item.thumbnail ?? '',
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ media }, { status: 200 });
  } catch (error) {
    console.error('Error fetching talent media:', error);
    return NextResponse.json(
      { media: [], error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
