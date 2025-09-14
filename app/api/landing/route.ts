import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch featured talent with their profiles
    const featuredTalent = await prisma.talentProfile.findMany({
      take: 8, // Get 8 featured talent for showcase
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
            icon: true,
          },
        },
        subcategory: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { viewCount: 'desc' },
      ],
    });

    // Fetch categories with talent counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            talentProfiles: true,
          },
        },
        subcategories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const landingData = {
      featuredTalent: featuredTalent.map(talent => ({
        id: talent.id,
        userId: talent.userId || talent.user?.id,
        name: talent.user?.name || null,
        roleDescription: talent.roleDescription,
        bio: talent.bio,
        location: talent.location,
        experience: talent.experience,
        rating: talent.rating,
        avatarUrl: talent.avatarUrl,
        skills: talent.skills,
        category: talent.category?.name,
        categoryIcon: talent.category?.icon,
        subcategory: talent.subcategory?.name,
        viewCount: talent.viewCount,
      })),
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        talentCount: category._count.talentProfiles,
        subcategories: category.subcategories,
      })),
    };

    return NextResponse.json(landingData);
  } catch (error) {
    console.error('Failed to fetch landing page data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
