import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import fs from 'fs';
import path from 'path';

// Built-in site assets that should appear in the media library
const SITE_ASSETS = [
  { filename: 'logo.svg', url: '/logo.svg', type: 'IMAGE' as const, mimeType: 'image/svg+xml', folder: '/branding' },
  { filename: 'globe.svg', url: '/globe.svg', type: 'IMAGE' as const, mimeType: 'image/svg+xml', folder: '/icons' },
  { filename: 'file.svg', url: '/file.svg', type: 'IMAGE' as const, mimeType: 'image/svg+xml', folder: '/icons' },
  { filename: 'window.svg', url: '/window.svg', type: 'IMAGE' as const, mimeType: 'image/svg+xml', folder: '/icons' },
  { filename: 'Welcome.mp4', url: '/videos/Welcome.mp4', type: 'VIDEO' as const, mimeType: 'video/mp4', folder: '/videos' },
];

// Scan the public directory for additional assets
function discoverPublicAssets(): typeof SITE_ASSETS {
  const discovered: typeof SITE_ASSETS = [];
  const publicDir = path.join(process.cwd(), 'public');

  // Scan hero slideshow images
  const heroDir = path.join(publicDir, 'images', 'hero-slideshow');
  if (fs.existsSync(heroDir)) {
    const heroFiles = fs.readdirSync(heroDir).filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    for (const file of heroFiles) {
      discovered.push({
        filename: file,
        url: `/images/hero-slideshow/${file}`,
        type: 'IMAGE',
        mimeType: `image/${file.split('.').pop()?.toLowerCase() === 'jpg' ? 'jpeg' : file.split('.').pop()?.toLowerCase()}`,
        folder: '/hero',
      });
    }
  }

  // Scan flag icons
  const flagDir = path.join(publicDir, 'flags');
  if (fs.existsSync(flagDir)) {
    const flagFiles = fs.readdirSync(flagDir).filter(f => /\.(svg|png)$/i.test(f));
    for (const file of flagFiles) {
      discovered.push({
        filename: file,
        url: `/flags/${file}`,
        type: 'IMAGE',
        mimeType: file.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
        folder: '/flags',
      });
    }
  }

  // Scan sample ads
  const adDir = path.join(publicDir, 'ads');
  if (fs.existsSync(adDir)) {
    const adFiles = fs.readdirSync(adDir).filter(f => /\.(svg|png|jpg|jpeg|webp)$/i.test(f));
    for (const file of adFiles) {
      discovered.push({
        filename: file,
        url: `/ads/${file}`,
        type: 'IMAGE',
        mimeType: file.endsWith('.svg') ? 'image/svg+xml' : `image/${file.split('.').pop()?.toLowerCase()}`,
        folder: '/ads',
      });
    }
  }

  return discovered;
}

// GET /api/admin/cms/media - List all media assets
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const folder = searchParams.get('folder');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    // Auto-populate site assets if the media library is empty
    const totalAssets = await prisma.mediaAsset.count();
    if (totalAssets === 0) {
      const allAssets = [...SITE_ASSETS, ...discoverPublicAssets()];
      const userId = (authResult as { user: { userId: string } }).user.userId;

      for (const asset of allAssets) {
        try {
          // Get file size if file exists on disk
          const filePath = path.join(process.cwd(), 'public', asset.url);
          const size = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;

          await prisma.mediaAsset.create({
            data: {
              filename: asset.filename,
              url: asset.url,
              type: asset.type,
              mimeType: asset.mimeType,
              size,
              folder: asset.folder,
              uploadedById: userId,
            },
          });
        } catch {
          // Skip duplicates or errors for individual assets
          continue;
        }
      }
    }

    const where: Record<string, string> = {};
    if (type) where.type = type;
    if (folder) where.folder = folder;

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          uploadedBy: { select: { name: true, email: true } },
        },
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media assets' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cms/media - Register a new upload
// Note: Actual file upload should happen to cloud storage (e.g. S3/ImageKit/Vercel Blob)
// This endpoint just records the metadata
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult as any;

  try {
    const body = await request.json();
    const { filename, url, type, mimeType, size, altText, folder } = body;

    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        type: type || 'OTHER',
        mimeType,
        size,
        altText,
        folder,
        uploadedById: user.userId,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error creating media asset record:', error);
    return NextResponse.json(
      { error: 'Failed to create media asset record' },
      { status: 500 }
    );
  }
}
