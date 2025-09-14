import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const filter = searchParams.get('filter') || 'all';

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.toLowerCase();
    const results = [];

  // Search talent
    if (filter === 'all' || filter === 'talent') {
      const talentResults = await prisma.talentProfile.findMany({
        take: 5,
        where: {
          OR: [
            {
              user: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            {
              roleDescription: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              skills: {
                hasSome: [searchTerm],
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      results.push(
        ...talentResults.map(talent => ({
          type: 'talent',
          id: talent.userId,
          name: talent.user?.name || 'Unknown',
          category: talent.category?.name || talent.roleDescription,
          avatarUrl: talent.avatarUrl,
        }))
      );
    }

    // Search categories
    if (filter === 'all' || filter === 'categories') {
      const categoryResults = await prisma.category.findMany({
        take: 5,
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: {
          _count: {
            select: {
              talentProfiles: true,
            },
          },
        },
      });

      results.push(
        ...categoryResults.map(category => ({
          type: 'category',
          id: category.id,
          name: category.name,
          count: category._count.talentProfiles,
          icon: category.icon,
        }))
      );
    }

    // Search subcategories (skills)
    if (filter === 'all' || filter === 'features') {
      const subcategoryResults = await prisma.subcategory.findMany({
        take: 5,
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      results.push(
        ...subcategoryResults.map(subcategory => ({
          type: 'skill',
          id: subcategory.id,
          name: subcategory.name,
          category: subcategory.category.name,
        }))
      );
    }

    return NextResponse.json(results.slice(0, 10)); // Limit to 10 results
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
