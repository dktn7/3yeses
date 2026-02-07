export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch portfolio media
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
      select: {
        id: true,
        portfolio: {
          select: { id: true, title: true, url: true, type: true, thumbnail: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({
        success: true,
        media: [],
      });
    }

    // Map PortfolioItem records to gallery media format
    const media = (profile.portfolio || []).map((item: any) => ({
      id: item.id,
      url: item.url,
      thumbnail: item.thumbnail,
      type: item.type === 'IMAGE' ? 'image' : item.type === 'VIDEO' ? 'video' : item.type === 'AUDIO' ? 'audio' : 'image',
      title: item.title,
    }));

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
