import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    
    console.log('📂 Attempting to serve file:', filePath);
    
    // Security: Prevent directory traversal attacks
    if (!filePath.startsWith(join(process.cwd(), 'public', 'uploads'))) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }
    
    try {
      const buffer = await readFile(filePath);
      console.log('✓ File served successfully:', filename, 'Size:', buffer.length);
      
      // Determine content type
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (filename.endsWith('.png')) {
        contentType = 'image/png';
      } else if (filename.endsWith('.gif')) {
        contentType = 'image/gif';
      } else if (filename.endsWith('.webp')) {
        contentType = 'image/webp';
      } else if (filename.endsWith('.mp4')) {
        contentType = 'video/mp4';
      } else if (filename.endsWith('.webm')) {
        contentType = 'video/webm';
      } else if (filename.endsWith('.mp3')) {
        contentType = 'audio/mpeg';
      } else if (filename.endsWith('.wav')) {
        contentType = 'audio/wav';
      } else if (filename.endsWith('.ogg')) {
        contentType = 'audio/ogg';
      }
      
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (readErr: any) {
      console.error('✗ Failed to read file:', readErr);
      return NextResponse.json(
        { error: 'File not found', details: readErr.message },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('✗ Server error serving file:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
