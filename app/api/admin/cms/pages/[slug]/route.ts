import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

async function handler(req: NextRequest, context: { params: Promise<{ slug: string }>; admin: any }) {
  const { slug } = await context.params;

  try {
    const page = await prisma.contentPage.findUnique({
      where: { slug },
      include: {
        published: true
      }
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);
