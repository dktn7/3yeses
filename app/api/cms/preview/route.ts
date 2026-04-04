import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// POST - receive draft content for preview, returns it back
// The actual preview mechanism uses sessionStorage on the client side,
// but this endpoint validates the admin is authorized to preview
async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, slug } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      title,
      content,
      slug,
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(handler);
