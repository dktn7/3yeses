// File Upload API
// POST /api/upload - Upload files (profile photos, portfolio images, videos)

import { NextRequest, NextResponse } from 'next/server';
import {
  uploadProfilePhoto,
  uploadPortfolioImage,
  uploadVideo,
  type UploadResult,
} from '@/lib/upload';



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string; // 'profile', 'portfolio', or 'video'
    const userId = formData.get('userId') as string | null;

    if (!type || !['profile', 'portfolio', 'video'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid upload type. Must be "profile", "portfolio", or "video"',
        },
        { status: 400 }
      );
    }

    // Handle profile photo (single file)
    if (type === 'profile') {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }

      const result = await uploadProfilePhoto(file, userId || undefined);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // Handle portfolio images (multiple files)
    if (type === 'portfolio') {
      const files = formData.getAll('files') as File[];
      if (!files || files.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No files provided' },
          { status: 400 }
        );
      }

      // Upload all files
      const results: UploadResult[] = [];
      for (const file of files) {
        const result = await uploadPortfolioImage(file, userId || undefined);
        results.push(result);
      }

      // Check if any uploads failed
      const failedUploads = results.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Some uploads failed',
            results,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        results,
        urls: results.map((r) => r.url),
      });
    }

    // Handle video (single file)
    if (type === 'video') {
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }

      const result = await uploadVideo(file, userId || undefined);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
