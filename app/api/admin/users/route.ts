import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthenticatedUser } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function handler(req: Request, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
