import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  const prisma = getPrisma();
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { like } = await request.json();
    const delta = like ? 1 : -1;

    const updated = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: { likeCount: { increment: delta } },
      select: { id: true, likeCount: true },
    });

    return NextResponse.json({ success: true, likeCount: updated.likeCount });
  } catch (error) {
    console.error('Portfolio like error:', error);
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    );
  }
}
