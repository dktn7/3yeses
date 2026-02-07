import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { like } = await request.json();
    const delta = like ? 1 : -1;

    const updated = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: { likes: { increment: delta } },
      select: { id: true, likes: true },
    });

    return NextResponse.json({ success: true, likes: updated.likes });
  } catch (error) {
    console.error('Portfolio like error:', error);
    return NextResponse.json(
      { error: 'Failed to update like' },
      { status: 500 }
    );
  }
}
