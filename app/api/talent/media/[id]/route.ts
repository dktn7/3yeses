import { NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

// Ensure only the owner of the media (talent profile's user) can edit/delete
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    // Read cookie header
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/accessToken=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    if (!token) return null;

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded?.userId ?? null;
  } catch {
    return null;
  }
}

async function isOwner(userId: string, portfolioItemId: string): Promise<boolean> {
  const item = await prisma.portfolioItem.findUnique({
    where: { id: portfolioItemId },
    select: { talentProfile: { select: { userId: true } } },
  });
  if (!item) return false;
  return item.talentProfile?.userId === userId;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
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
        url: true,
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const owns = await isOwner(userId, id);
    if (!owns) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
