
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { id: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        talentProfile: {
          select: {
            avatarUrl: true,
          },
        },
      },
    });

    const suggestions = users.map((user) => {
      let matchField = 'ID';
      const lowerQ = q.toLowerCase();
      
      if (user.name.toLowerCase().includes(lowerQ)) {
        matchField = 'Name';
      } else if (user.email.toLowerCase().includes(lowerQ)) {
        matchField = 'Email';
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.talentProfile?.avatarUrl || null,
        matchField,
      };
    });

    return NextResponse.json({ users: suggestions });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
