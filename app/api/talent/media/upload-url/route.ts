export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Create portfolio media from a URL
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { url, type, title, description, thumbnail } = body as {
      url: string;
      type: 'image' | 'video' | 'audio';
      title?: string;
      description?: string;
      thumbnail?: string | null;
    };

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing media URL' },
        { status: 400 }
      );
    }

    if (!['image', 'video', 'audio'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid media type' },
        { status: 400 }
      );
    }

    // Find profile
    const profile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found. Please complete your profile setup first.' },
        { status: 404 }
      );
    }

    const portfolioType = type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : 'AUDIO';

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title: title || 'Untitled',
        description: description || '',
        url,
        type: portfolioType as any,
        thumbnail: thumbnail || undefined,
        talentProfileId: profile.id,
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: portfolioItem.id,
        url: portfolioItem.url,
        type,
        title: portfolioItem.title,
        thumbnail: portfolioItem.thumbnail,
        createdAt: portfolioItem.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload-URL error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create media from URL' },
      { status: 500 }
    );
  }
}
