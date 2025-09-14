import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const location = searchParams.get('location');
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);

    if (!subcategoryId) {
      return NextResponse.json(
        { error: 'Subcategory ID is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      subcategoryId: subcategoryId,
    };

    // Add price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.ratePerHour = {};
      if (minPrice !== undefined) (whereClause.ratePerHour as Record<string, number>).gte = minPrice;
      if (maxPrice !== undefined) (whereClause.ratePerHour as Record<string, number>).lte = maxPrice;
    }

    // Add location filter
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Add skills filter
    if (skills && skills.length > 0) {
      whereClause.skills = {
        hasSome: skills,
      };
    }

    // Add rating filter (need to calculate average from reviews)
    if (minRating) {
      whereClause.reviewsReceived = {
        some: {
          rating: {
            gte: minRating,
          },
        },
      };
    }

    // Build order by clause
  // Prisma typing for orderBy can be complex; use any-safe shape here for now
  let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: sortOrder };
        break;
      case 'price':
        orderBy = { ratePerHour: sortOrder };
        break;
      case 'experience':
        orderBy = { experience: sortOrder };
        break;
      default:
        orderBy = { user: { createdAt: sortOrder } }; // Use user's createdAt
    }

    // Get talent profiles
    const [talents, totalCount] = await Promise.all([
      prisma.talentProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
            },
          },
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviewsReceived: true,
              portfolio: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.talentProfile.count({ where: whereClause }),
    ]);

    // Calculate average ratings and format response
    const formattedTalents = talents.map(talent => {
      const avgRating = talent.reviewsReceived.length > 0 
        ? talent.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / talent.reviewsReceived.length
        : 0;

      return {
        id: talent.id,
        roleDescription: talent.roleDescription,
        bio: talent.bio,
        ratePerHour: talent.ratePerHour,
        location: talent.location,
        experience: talent.experience,
  // availability removed from schema
        rating: Number(avgRating.toFixed(1)),
        reviewCount: talent._count.reviewsReceived,
        portfolioCount: talent._count.portfolio,
        user: talent.user,
        category: talent.category,
        subcategory: talent.subcategory,
        skills: talent.skills,
        gender: talent.gender,
        age: talent.age,
        height: talent.height,
        avatarUrl: talent.avatarUrl,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      talents: formattedTalents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching subcategory talents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch talents' },
      { status: 500 }
    );
  }
}
