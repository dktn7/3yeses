import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 1) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        talentProfile: {
          select: {
            avatarUrl: true,
          },
        },
      },
      take: 8,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        avatarUrl: u.talentProfile?.avatarUrl || null,
      })),
    });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ users: [] });
  }
}
