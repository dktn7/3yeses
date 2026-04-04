// File Upload API
// POST /api/upload - Register uploaded files (after client-side ImageKit upload)
// Client uploads directly to ImageKit, then sends the response data here

import { NextRequest, NextResponse } from 'next/server';
import type { UploadResult } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, fileId, fileName, type } = body;

    if (!url || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: url, type',
        },
        { status: 400 }
      );
    }

    if (!['profile', 'portfolio', 'video'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid upload type. Must be "profile", "portfolio", or "video"',
        },
        { status: 400 }
      );
    }

    const result: UploadResult = {
      success: true,
      url,
      fileId,
      filename: fileName,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
