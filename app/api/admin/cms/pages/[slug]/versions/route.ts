import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

async function getHandler(req: NextRequest, context: { params: Promise<{ slug: string }>; admin: any }) {
  const { slug } = await context.params;
  const searchParams = req.nextUrl.searchParams;
  const locale = searchParams.get('locale');

  if (!locale) {
    return NextResponse.json(
      { error: 'Locale is required' },
      { status: 400 }
    );
  }

  try {
    const versions = await prisma.contentVersion.findMany({
      where: { 
        pageSlug: slug,
        locale
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

async function postHandler(req: NextRequest, context: { params: Promise<{ slug: string }>; admin: any }) {
  const { slug } = await context.params;
  
  try {
    const body = await req.json();
    const { locale, title, content, changeNote } = body;

    if (!locale || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const version = await prisma.contentVersion.create({
      data: {
        pageSlug: slug,
        locale,
        title,
        content,
        changeNote,
        authorId: context.admin.id
      }
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
