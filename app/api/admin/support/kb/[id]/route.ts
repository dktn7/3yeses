import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

export async function GET(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { id } = await context.params;

  try {
    // @ts-ignore
    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { title, slug, content, category, tags, isPublished } = body;

    // @ts-ignore
    const article = await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        category,
        tags,
        isPublished,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating KB article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { id } = await context.params;

  try {
    // @ts-ignore
    await prisma.knowledgeBaseArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting KB article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
