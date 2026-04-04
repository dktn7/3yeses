import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

// Ensure only the owner of the media (talent profile's user) can edit/delete
import { NextRequest } from 'next/server';

async function isOwner(userId: string, portfolioItemId: string): Promise<boolean> {
  const item = await prisma.portfolioItem.findUnique({
    where: { id: portfolioItemId },
    select: { talentProfile: { select: { userId: true } } },
  });
  if (!item) return false;
  return item.talentProfile?.userId === userId;
}

export async function PATCH(req: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  try {
    const auth = await authenticateUser(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.userId;

    // Unwrap params in case it's a Promise in this runtime
    const resolvedParams: any = typeof (params as any)?.then === 'function' ? await (params as any) : params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const owns = await isOwner(userId, id);
    if (!owns) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { title, description, thumbnail } = body as { title?: string; description?: string; thumbnail?: string };

    const updated = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(typeof title === 'string' ? { title } : {}),
        ...(typeof description === 'string' ? { description } : {}),
        ...(typeof thumbnail === 'string' ? { thumbnail } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        mediaUrl: true,
        type: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, media: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.userId;
    const params = (context && context.params) || { id: undefined };
    const resolvedParams: any = typeof (params as any)?.then === 'function' ? await (params as any) : params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const owns = await isOwner(userId, id);
    if (!owns) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
