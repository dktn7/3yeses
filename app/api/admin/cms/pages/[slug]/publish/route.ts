import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

async function handler(req: NextRequest, context: { params: Promise<{ slug: string }>; admin: any }) {
  const { slug } = await context.params;
  
  try {
    const body = await req.json();
    const { versionId, locale } = body;

    if (!versionId || !locale) {
      return NextResponse.json(
        { error: 'Version ID and locale are required' },
        { status: 400 }
      );
    }

    // Verify version exists and matches page/locale
    const version = await prisma.contentVersion.findUnique({
      where: { id: versionId }
    });

    if (!version || version.pageSlug !== slug || version.locale !== locale) {
      return NextResponse.json(
        { error: 'Invalid version' },
        { status: 400 }
      );
    }

    const published = await prisma.publishedContent.upsert({
      where: {
        pageSlug_locale: {
          pageSlug: slug,
          locale
        }
      },
      update: {
        versionId
      },
      create: {
        pageSlug: slug,
        locale,
        versionId
      }
    });

    return NextResponse.json(published);
  } catch (error) {
    console.error('Error publishing version:', error);
    return NextResponse.json(
      { error: 'Failed to publish version' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handler);
