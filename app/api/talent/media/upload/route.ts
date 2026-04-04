export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

// POST - Register portfolio media after client-side ImageKit upload
// Expects JSON body with: { url, fileId, type, title?, description?, thumbnail? }
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.authenticated || !auth.user) return auth.response!;
    const { userId } = auth.user;

    const body = await req.json();
    const { url: mediaUrl, fileId, type, title, description, thumbnail } = body;

    if (!mediaUrl || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: url, type' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['image', 'video', 'audio'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid media type' },
        { status: 400 }
      );
    }

    // Get existing profile
    const profile = await prisma.talentProfile.findUnique({ where: { userId } });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found. Please complete your profile setup first.' },
        { status: 404 }
      );
    }

    const profileId = (profile as any).id ?? (profile as any).userId;

    // Create a PortfolioItem entry for richer metadata
    const portfolioType =
      type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : 'AUDIO';

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title: title || 'Untitled',
        description: description || '',
        mediaUrl,
        type: portfolioType as any,
        thumbnail: thumbnail || undefined,
        talentProfileId: profileId,
        imagekitFileId: fileId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: portfolioItem.id,
        mediaUrl: portfolioItem.mediaUrl,
        type,
        title: portfolioItem.title,
        thumbnail: portfolioItem.thumbnail,
        createdAt: portfolioItem.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register uploaded file' },
      { status: 500 }
    );
  }
}
