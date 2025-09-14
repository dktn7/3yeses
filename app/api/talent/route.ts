// Talent Search and Listing API
// GET /api/talent - Search/filter talents with pagination
// POST /api/talent - Create new talent profile (authenticated)

import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth/middleware';
import type { AuthenticatedUser, ApiResponse } from '@/types/api';

const prisma = new PrismaClient();

// GET - Search and filter talents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const location = searchParams.get('location');
    const genderParam = searchParams.get('gender');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as Prisma.SortOrder) || 'desc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

  // Build where clause
  let whereClause: Prisma.TalentProfileWhereInput = {
      user: {
        role: 'TALENT',
      },
    };

    // Apply filters
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
        { roleDescription: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } },
      ];
    }

    if (category) {
      whereClause.category = { name: category };
    }

    if (subcategory) {
      whereClause.subcategory = { name: subcategory };
    }

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (genderParam) {
      const mapGender = (g: string) => {
        const key = g.toLowerCase();
        if (key === 'male') return 'MALE';
        if (key === 'female') return 'FEMALE';
        if (key === 'non-binary' || key === 'non_binary' || key === 'non binary') return 'NON_BINARY';
        return 'PREFER_NOT_TO_SAY';
      };

      const mapped = mapGender(genderParam);
      whereClause = { ...whereClause, gender: mapped as Prisma.TalentProfileWhereInput['gender'] };
    }

    // Build orderBy clause
    const orderBy: Prisma.TalentProfileOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'name':
        orderBy.user = { name: sortOrder };
        break;
      default:
        orderBy.user = { createdAt: sortOrder };
    }

    // Fetch talents with pagination
    const [talents, totalCount] = await prisma.$transaction([
      prisma.talentProfile.findMany({
        where: whereClause,
        orderBy,
        skip: offset,
        take: limit,
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
              icon: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
            },
          },
          portfolio: {
            take: 3,
            select: {
              id: true,
              title: true,
              url: true,
              type: true,
            },
          },
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.talentProfile.count({ where: whereClause }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Format response
    const formattedTalents = talents.map(
      talent => ({
        id: talent.id,
        userId: talent.userId,
        name: talent.user.name,
        roleDescription: talent.roleDescription,
        bio: talent.bio,
        location: talent.location,
        rating: talent.rating,
        avatarUrl: talent.avatarUrl,
        videoUrl: talent.videoUrl,
        experience: talent.experience,
        skills: talent.skills,
        gender: talent.gender,
        category: talent.category,
        subcategory: talent.subcategory,
        portfolio: talent.portfolio,
        reviewCount: talent.reviewsReceived.length,
        viewCount: talent.viewCount,
        isBeginner: talent.isBeginner,
        joinedAt: talent.user.createdAt,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        talents: formattedTalents,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext,
          hasPrev,
          limit,
        },
        filters: {
          search,
          category,
          subcategory,
          location,
          gender: genderParam,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching talents:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch talents',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// POST - Create/Update talent profile (authenticated)
export const POST = withAuth(async (
  request: NextRequest,
  user: AuthenticatedUser
): Promise<NextResponse<ApiResponse<unknown>>> => {
  try {
    const body = await request.json();

    if (user.role !== 'TALENT') {
      return NextResponse.json(
        {
          success: false,
          message: 'Only talent users can create talent profiles',
        },
        { status: 403 }
      );
    }

    // Check if talent profile already exists
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: user.userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Talent profile already exists. Use PUT to update.',
        },
        { status: 409 }
      );
    }

    // Validate required fields
    const { roleDescription, bio, categoryId } = body;

    if (!roleDescription || !bio || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Missing required fields: roleDescription, bio, categoryId',
        },
        { status: 400 }
      );
    }

    // Create talent profile
    const talentProfile = await prisma.talentProfile.create({
      data: {
        user: { connect: { id: user.userId } },
        roleDescription,
        bio,
        location: body.location,
        experience: body.experience || 0,
        gender: body.gender,
        ethnicity: body.ethnicity,
        age: body.age,
        height: body.height,
        bodyType: body.bodyType,
        eyeColor: body.eyeColor,
        hairColor: body.hairColor,
        languages: body.languages || [],
        skills: body.skills || [],
        avatarUrl: body.avatarUrl,
        videoUrl: body.videoUrl,
        socialMedia: body.socialMedia || undefined,
        category: { connect: { id: categoryId } },
        subcategory: body.subcategoryId
          ? { connect: { id: body.subcategoryId } }
          : undefined,
        isBeginner: body.isBeginner || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        subcategory: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: talentProfile,
      message: 'Talent profile created successfully',
    });
  } catch (error) {
    console.error('Error creating talent profile:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create talent profile',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
});
