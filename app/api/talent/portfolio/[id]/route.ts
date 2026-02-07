import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// DELETE - Remove portfolio item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const mediaId = params.id;

    // Parse media ID to determine type (img-0, vid-1, etc.)
    const [type, index] = mediaId.split('-');
    const arrayIndex = parseInt(index);

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Remove from appropriate array
    if (type === 'img' && profile.portfolioImages) {
      const newImages = [...profile.portfolioImages];
      newImages.splice(arrayIndex, 1);

      await prisma.talentProfile.update({
        where: { userId: decoded.userId },
        data: { portfolioImages: newImages },
      });
    } else if (type === 'vid' && profile.videoUrls) {
      const newVideos = [...profile.videoUrls];
      newVideos.splice(arrayIndex, 1);

      await prisma.talentProfile.update({
        where: { userId: decoded.userId },
        data: { videoUrls: newVideos },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
