export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// GET - List media for the authenticated talent profile
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/accessToken=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    if (!token) {
      return NextResponse.json({ media: [] }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded?.userId as string | undefined;

    if (!userId) {
      return NextResponse.json({ media: [] }, { status: 401 });
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ media: [] }, { status: 200 });
    }

    const items = await prisma.portfolioItem.findMany({
      where: { talentProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        type: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    const media = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      url: item.url,
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
