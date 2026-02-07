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

    // In a real app, you would handle file upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll simulate with a placeholder
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
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
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update portfolio based on type
    let updatedProfile;
    if (type === 'image') {
      updatedProfile = await prisma.talentProfile.update({
        where: { userId: decoded.userId },
        data: {
          portfolioImages: {
            push: fileUrl,
          },
        },
      });
    } else if (type === 'video') {
      updatedProfile = await prisma.talentProfile.update({
        where: { userId: decoded.userId },
        data: {
          videoUrls: {
            push: fileUrl,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      media: {
        id: `${type}-${Date.now()}`,
        url: fileUrl,
        type,
        title: file.name,
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
