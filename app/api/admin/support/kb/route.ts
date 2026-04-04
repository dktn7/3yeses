import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

// GET /api/admin/support/kb - List all KB articles
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const isPublished = searchParams.get('isPublished');

  try {
    const where: any = {};
    if (category) where.category = category;
    if (isPublished !== null) where.isPublished = isPublished === 'true';

    // @ts-ignore
    const articles = await prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching KB articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/support/kb - Create new article
export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  // @ts-ignore
  const { user } = authResult;

  try {
    const body = await request.json();
    const { title, slug, content, category, tags, isPublished } = body;

    // @ts-ignore
    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        slug,
        content,
        category,
        tags: tags || [],
        isPublished: isPublished || false,
        authorId: user.userId, // Use authenticated admin ID
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating KB article:', error);
    return NextResponse.json(
      { error: 'Failed to create article. Slug might be taken.' },
      { status: 500 }
    );
  }
}
