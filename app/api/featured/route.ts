import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slot = url.searchParams.get('slot');
    const now = new Date();

    const where: any = {
      active: true,
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    };

    if (slot) where.slot = slot;

    const featuredItems = await prisma.featuredItem.findMany({
      where,
      include: {
        talentProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        portfolioItem: {
          include: {
            talentProfile: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
      orderBy: { priority: 'desc' },
    });

    return NextResponse.json(featuredItems);
  } catch (error) {
    console.error('Error fetching public featured items:', error);
    return NextResponse.json({ error: 'Failed to fetch featured items' }, { status: 500 });
  }
}
