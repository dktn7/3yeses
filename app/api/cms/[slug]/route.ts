import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const locale = request.nextUrl.searchParams.get('locale') || 'en-gb';

    const published = await prisma.publishedContent.findUnique({
      where: { pageSlug_locale: { pageSlug: slug, locale } },
      include: {
        version: {
          select: {
            title: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!published) {
      return NextResponse.json(
        { error: 'No published content found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: published.version.title,
      content: published.version.content,
      updatedAt: published.version.createdAt,
    });
  } catch (error) {
    console.error('CMS content fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
