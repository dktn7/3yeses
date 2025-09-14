import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const location = searchParams.get('location');
    const minAge = searchParams.get('minAge') ? parseInt(searchParams.get('minAge')!, 10) : undefined;
    const maxAge = searchParams.get('maxAge') ? parseInt(searchParams.get('maxAge')!, 10) : undefined;
    const minExperience = searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!, 10) : undefined;
    const maxExperience = searchParams.get('maxExperience') ? parseInt(searchParams.get('maxExperience')!, 10) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);
    const languages = searchParams.get('languages')?.split(',').filter(Boolean);
    const gender = searchParams.get('gender');
  const bodyTypeParam = searchParams.get('bodyType');
  const ethnicityParam = searchParams.get('ethnicity');
  const bodyTypesRaw = bodyTypeParam ? bodyTypeParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;
  const ethnicities = ethnicityParam ? ethnicityParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;
  // const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const skip = (page - 1) * limit;

  // Build where clause for comprehensive search
  const whereClause: Record<string, unknown> = {};
  const orClauses: unknown[] = [];

    // Text search across multiple fields
    if (query) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      orClauses.push(
        // Search in user name
        {
          user: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        // Search in role description
        {
          roleDescription: {
            contains: query,
            mode: 'insensitive'
          }
        },
        // Search in bio
        {
          bio: {
            contains: query,
            mode: 'insensitive'
          }
        },
        // Search in skills array
        {
          skills: {
            hasSome: searchTerms
          }
        },
        // Search in languages array
        {
          languages: {
            hasSome: searchTerms
          }
        },
        // Search in category name
        {
          category: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        // Search in subcategory name
        {
          subcategory: {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          }
        },
        // Search in location
        {
          location: {
            contains: query,
            mode: 'insensitive'
          }
        }
      );
    }

    // Category filter
    if (category) {
      whereClause.category = {
        name: {
          contains: category,
          mode: 'insensitive'
        }
      };
    }

    // Subcategory filter
    if (subcategory) {
      whereClause.subcategory = {
        name: {
          contains: subcategory,
          mode: 'insensitive'
        }
      };
    }

    // Location filter
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Age range filter
    if (minAge !== undefined || maxAge !== undefined) {
      const ageFilter: Record<string, number> = {};
      if (minAge !== undefined) ageFilter.gte = minAge;
      if (maxAge !== undefined) ageFilter.lte = maxAge;
      if (Object.keys(ageFilter).length > 0) (whereClause as Record<string, unknown>)['age'] = ageFilter;
    }

    // Experience range filter
    if (minExperience !== undefined || maxExperience !== undefined) {
      const expFilter: Record<string, number> = {};
      if (minExperience !== undefined) expFilter.gte = minExperience;
      if (maxExperience !== undefined) expFilter.lte = maxExperience;
      if (Object.keys(expFilter).length > 0) (whereClause as Record<string, unknown>)['experience'] = expFilter;
    }

    // Skills filter
    if (skills && skills.length > 0) {
      whereClause.skills = {
        hasSome: skills
      };
    }

    // Languages filter
    if (languages && languages.length > 0) {
      whereClause.languages = {
        hasSome: languages
      };
    }

    // Gender filter
    if (gender) {
      whereClause.gender = gender.toUpperCase();
    }

    // Body type filter (comma-separated list)
    if (bodyTypesRaw && bodyTypesRaw.length > 0) {
      const mapBodyType = (b: string) => {
        const s = b.toLowerCase();
        if (s === 'slim') return 'SLIM';
        if (s === 'athletic') return 'ATHLETIC';
        if (s === 'curvy') return 'CURVY';
        if (s === 'plus-size' || s === 'plus_size' || s === 'plussize') return 'PLUS_SIZE';
        if (s === 'muscular') return 'MUSCULAR';
        if (s === 'average') return undefined; // not a DB enum
        return undefined;
      };
      const mapped = bodyTypesRaw.map(mapBodyType).filter(Boolean) as string[];
      if (mapped.length > 0) {
        whereClause.bodyType = { in: mapped };
      }
    }

    // Ethnicity filter (comma-separated, ILIKE contains)
    if (ethnicities && ethnicities.length > 0) {
      const ethOr = ethnicities.map((e) => ({ ethnicity: { contains: e, mode: 'insensitive' } }));
      ethOr.forEach((clause) => (orClauses as Array<Record<string, unknown>>).push(clause));
    }

    // (Availability not modeled in Prisma schema)

    if (orClauses.length > 0) {
      (whereClause as Record<string, unknown>)['OR'] = orClauses as Array<Record<string, unknown>>;
    }

    // Build order by clause
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = {};
    switch (sortBy) {
      case 'name':
        orderBy = { user: { name: 'asc' } };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'newest':
        orderBy = { user: { createdAt: 'desc' } };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      default: // relevance
        orderBy = [
          { viewCount: 'desc' },
          { rating: 'desc' },
          { user: { createdAt: 'desc' } }
        ];
    }

    // Execute search with rating filter applied via aggregation
    const talents = await prisma.talentProfile.findMany({
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
            icon: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        portfolio: {
          select: {
            id: true,
            title: true,
            url: true,
            type: true,
          },
          take: 3, // Limit portfolio items for performance
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
    });

    // Get total count for pagination
    const totalCount = await prisma.talentProfile.count({ where: whereClause });

    // Format results
    const formattedTalents = talents.map(talent => {
      const avgRating = talent.reviewsReceived.length > 0
        ? talent.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / talent.reviewsReceived.length
        : 0;

      return {
        id: talent.id,
        name: talent.user.name,
        role: talent.roleDescription || 'Professional Talent',
        category: talent.category?.name || 'Uncategorized',
        subcategory: talent.subcategory?.name || 'General',
        skills: talent.skills || [],
        videoUrl: talent.videoUrl,
        avatarUrl: talent.avatarUrl,
        location: talent.location || 'Location not specified',
        experience: talent.experience || 0,
        rating: Number(avgRating.toFixed(1)),
        languages: talent.languages || [],
        bio: talent.bio || 'No bio available',
  // availability not included
        gender: talent.gender?.toLowerCase() as 'male' | 'female' | 'non-binary' | 'other' || 'other',
        ethnicity: talent.ethnicity || 'Not specified',
        age: talent.age || 0,
        height: talent.height || 0,
        bodyType: talent.bodyType?.toLowerCase() as 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size' | 'muscular' || 'average',
        eyeColor: talent.eyeColor || 'Not specified',
        hairColor: talent.hairColor || 'Not specified',
        socialMedia: Array.isArray(talent.socialMedia) 
          ? talent.socialMedia as { platform: string; url: string }[]
          : [],
        portfolio: talent.portfolio.map(item => ({
          title: item.title,
          url: item.url,
          type: item.type.toLowerCase() as 'image' | 'video' | 'audio',
        })),
        reviews: [], // Don't include full reviews in search results for performance
        isBeginner: talent.isBeginner,
        viewCount: talent.viewCount,
      };
    }).filter(talent => {
      // Apply rating filter here since it requires calculation
      if (minRating && talent.rating < minRating) {
        return false;
      }
      return true;
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Get filter suggestions for enhanced search experience
    const filterSuggestions = await getFilterSuggestions(query);

    return NextResponse.json({
      talents: formattedTalents,
      pagination: {
        page,
        limit,
        totalCount: formattedTalents.length, // Use filtered count
        totalPages: Math.ceil(formattedTalents.length / limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      query,
      filters: {
        category,
        subcategory,
        location,
        minRating,
        skills,
        languages,
        gender,
  // availability,
        sortBy,
      },
      suggestions: filterSuggestions,
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

// Helper function to get filter suggestions
async function getFilterSuggestions(query: string) {
  try {
    if (!query) return { categories: [], skills: [], locations: [] };

    const [categories, skills, locations] = await Promise.all([
      // Get matching categories
      prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: { name: true, icon: true },
        take: 5,
      }),
      
      // Get matching skills (aggregate from all talent profiles)
      prisma.talentProfile.findMany({
        where: {
          skills: {
            hasSome: [query]
          }
        },
        select: { skills: true },
        take: 50,
      }),
      
      // Get matching locations
      prisma.talentProfile.findMany({
        where: {
          location: {
            contains: query,
            mode: 'insensitive'
          }
        },
        select: { location: true },
        take: 10,
        distinct: ['location'],
      }),
    ]);

    // Extract unique skills that match the query
    const allSkills = skills.flatMap(talent => talent.skills || []);
    const matchingSkills = [...new Set(allSkills)]
      .filter(skill => skill.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);

    return {
      categories: categories.map(cat => ({ name: cat.name, icon: cat.icon })),
      skills: matchingSkills,
      locations: locations.map(talent => talent.location).filter(Boolean),
    };

  } catch (error) {
    console.error('Error getting filter suggestions:', error);
    return { categories: [], skills: [], locations: [] };
  }
}
