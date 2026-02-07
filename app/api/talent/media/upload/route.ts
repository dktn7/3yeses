export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST - Upload portfolio media
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

    // Handle file upload
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || '';
    const title = (formData.get('title') as string) || (file?.name ?? 'Untitled');
    const description = (formData.get('description') as string) || '';
    
    // Handle thumbnail: either URL or file
    let thumbnail = '';
    const thumbnailFile = formData.get('thumbnailFile') as File | null;
    const thumbnailUrl = (formData.get('thumbnail') as string) || '';
    
    if (thumbnailFile) {
      // Convert file to base64 data URL
      const buffer = await thumbnailFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      thumbnail = `data:${thumbnailFile.type};base64,${base64}`;
    } else if (thumbnailUrl) {
      thumbnail = thumbnailUrl;
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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

    // Save file to public/uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✓ Uploads directory created/verified:', uploadsDir);
    } catch (err) {
      console.error('Failed to create uploads directory:', err);
    }
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = join(uploadsDir, fileName);
    const fileUrl = `/api/uploads/${fileName}`; // Use API route to serve files
    
    // Write file to disk
    const buffer = await file.arrayBuffer();
    try {
      await writeFile(filePath, Buffer.from(buffer));
      console.log('✓ File written successfully:', filePath);
      console.log('✓ File size:', Buffer.from(buffer).length, 'bytes');
    } catch (writeErr) {
      console.error('✗ Failed to write file:', writeErr);
      return NextResponse.json(
        { success: false, error: 'Failed to save file to disk' },
        { status: 500 }
      );
    }

    // Get existing profile
    const profile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found. Please complete your profile setup first.' },
        { status: 404 }
      );
    }

    // Create a PortfolioItem entry for richer metadata
    const portfolioType =
      type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : 'AUDIO';

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title,
        description,
        url: fileUrl,
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
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
