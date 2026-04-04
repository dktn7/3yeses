import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const gender = searchParams.get('gender')?.split(',').filter(Boolean);
    const bodyType = searchParams.get('bodyType')?.split(',').filter(Boolean);
    const ethnicity = searchParams.get('ethnicity');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    const eyeColor = searchParams.get('eyeColor')?.split(',').filter(Boolean);
    const hairColor = searchParams.get('hairColor')?.split(',').filter(Boolean);
    const skills = searchParams.get('skills')?.split(',').filter(Boolean);
    const languages = searchParams.get('languages')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') || 'relevance';

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    // Apply filters based on query parameters
    if (category) {
      whereClause.categoryId = category;
    }
    
    if (subcategory) {
      whereClause.subcategoryId = subcategory;
    }

    if (query) {
      const searchTerms = query.toLowerCase().split(' ').filter((term: string) => term.length > 0);
      whereClause.OR = [
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { bio: { contains: query, mode: 'insensitive' } },
        { performerTitle: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: searchTerms } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
        { subcategory: { name: { contains: query, mode: 'insensitive' } } },
        { location: { contains: query, mode: 'insensitive' } },
        { languages: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ];
    }

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (gender && gender.length > 0) {
      const mappedGender = gender.map((g: string) => {
        const upper = g.toUpperCase();
        if (upper === 'NON-BINARY') return 'NON_BINARY';
        return upper;
      });
      whereClause.gender = { in: mappedGender };
    }

    if (bodyType && bodyType.length > 0) {
      const mappedBodyType = bodyType.map((b: string) => {
        return b.toUpperCase().replace(/\s+/g, '_').replace('-', '_');
      });
      whereClause.bodyType = { in: mappedBodyType };
    }

    if (ethnicity) {
      const e = ethnicity;
      const lower = e.toLowerCase();
      let mappedEthnicity = e.toUpperCase().replace(/[\s/-]/g, '_');
      
      if (lower === 'white') mappedEthnicity = 'WHITE_CAUCASIAN';
      else if (lower === 'black/african' || lower === 'black') mappedEthnicity = 'BLACK_AFRICAN';
      else if (lower === 'hispanic/latino') mappedEthnicity = 'HISPANIC_LATINO';
      else if (lower === 'asian') mappedEthnicity = 'ASIAN';
      else if (lower === 'middle eastern') mappedEthnicity = 'MIDDLE_EASTERN';
      else if (lower === 'mixed race' || lower === 'mixed') mappedEthnicity = 'MIXED_MULTIRACIAL';
      else if (lower === 'other') mappedEthnicity = 'OTHER';
      
      whereClause.ethnicity = mappedEthnicity;
    }

    if (minAge || maxAge) {
      whereClause.age = {};
      if (minAge) whereClause.age.gte = parseInt(minAge);
      if (maxAge) whereClause.age.lte = parseInt(maxAge);
    }

    if (minHeight || maxHeight) {
      whereClause.height = {};
      if (minHeight) whereClause.height.gte = parseInt(minHeight);
      if (maxHeight) whereClause.height.lte = parseInt(maxHeight);
    }

    if (eyeColor && eyeColor.length > 0) {
      whereClause.eyeColor = { in: eyeColor };
    }

    if (hairColor && hairColor.length > 0) {
      whereClause.hairColor = { in: hairColor };
    }

    if (skills && skills.length > 0) {
      whereClause.skills = { hasSome: skills };
    }

    // Languages is a relation (Language model with name/proficiency)
    if (languages && languages.length > 0) {
      whereClause.languages = {
        some: {
          name: { in: languages }
        }
      };
    }

    // Build order by clause
    let orderBy: Record<string, unknown> | Record<string, unknown>[] = {};
    switch (sortBy) {
      case 'name':
        orderBy = { user: { name: 'asc' } };
        break;
      case 'experience':
        orderBy = { experienceLevel: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      default: // relevance
        orderBy = [
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ];
    }

    const [talents, total] = await Promise.all([
      prisma.talentProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          },
          category: {
            select: { id: true, name: true }
          },
          subcategory: {
            select: { id: true, name: true }
          },
          portfolio: {
            select: {
              id: true,
              title: true,
              mediaUrl: true,
              type: true,
              thumbnail: true,
              description: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip,
        take: pageSize,
        orderBy,
      }),
      prisma.talentProfile.count({ where: whereClause }),
    ]);

    // Transform data to match client expectation
    const transformedTalents = talents.map((talent) => ({
      id: (talent as any).userId,
      name: (talent as any).user?.name || '',
      role: talent.performerTitle || '',
      title: talent.performerTitle || '',
      description: talent.bio || '',
      location: talent.location || '',
      // rating removed per platform decision
      avatarUrl: talent.avatarUrl,
      videoUrl: talent.videoUrl,
      category: talent.category?.name || '',
      subcategory: talent.subcategory?.name || '',
      skills: talent.skills || [],
      featuredSkills: (talent as any).featuredSkills || [],
      viewCount: talent.viewCount || 0,
      portfolio: talent.portfolio.map(item => ({
        id: item.id,
        title: item.title,
        mediaUrl: item.mediaUrl,
        type: item.type,
        thumbnail: item.thumbnail || (item.type === 'IMAGE' ? item.mediaUrl : undefined),
        description: item.description || '',
        talentProfile: {
          id: (talent as any).userId,
          user: { name: (talent as any).user?.name || '' },
          avatarUrl: talent.avatarUrl,
          category: talent.category ? { name: talent.category.name } : undefined
        },
        views: 0,
        likes: 0,
        isSponsored: false,
        createdAt: item.createdAt.toISOString()
      })),
    }));

    return NextResponse.json({
      success: true,
      talents: transformedTalents,
      total
    });

  } catch (error) {
    console.error('Error in talent search (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch talents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  try {
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn('Invalid or empty JSON body, using defaults');
      body = {};
    }
    console.log('Talent Search POST body:', JSON.stringify(body, null, 2));

    const {
      categoryId,
      subcategoryId,
      page = 1,
      pageSize = 12,
      gender,
      ethnicity,
      ageRange,
      heightRange,
      bodyType,
      experienceLevel,
      location,
      eyeColor,
      hairColor,
      skills,
      languages
    } = body;

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (subcategoryId) {
      whereClause.subcategoryId = subcategoryId;
    }

    // Apply filters
    if (gender && gender.length > 0) {
      const mappedGender = gender.map((g: string) => {
        const upper = g.toUpperCase();
        if (upper === 'NON-BINARY') return 'NON_BINARY';
        return upper;
      });
      whereClause.gender = { in: mappedGender };
    }

    if (ethnicity && ethnicity.length > 0) {
      const mappedEthnicity = ethnicity.map((e: string) => {
        const lower = e.toLowerCase();
        if (lower === 'white') return 'WHITE_CAUCASIAN';
        if (lower === 'black/african') return 'BLACK_AFRICAN';
        if (lower === 'hispanic/latino') return 'HISPANIC_LATINO';
        if (lower === 'asian') return 'ASIAN';
        if (lower === 'middle eastern') return 'MIDDLE_EASTERN';
        if (lower === 'mixed race') return 'MIXED_MULTIRACIAL';
        if (lower === 'other') return 'OTHER';
        return e.toUpperCase().replace(/[\s/-]/g, '_');
      });
      whereClause.ethnicity = { in: mappedEthnicity };
    }

    if (ageRange) {
      if (ageRange.min !== undefined) whereClause.age = { ...whereClause.age, gte: ageRange.min };
      if (ageRange.max !== undefined) whereClause.age = { ...whereClause.age, lte: ageRange.max };
    }

    if (heightRange) {
      if (heightRange.min !== undefined) whereClause.height = { ...whereClause.height, gte: heightRange.min };
      if (heightRange.max !== undefined) whereClause.height = { ...whereClause.height, lte: heightRange.max };
    }

    if (bodyType && bodyType.length > 0) {
      const mappedBodyType = bodyType.map((b: string) => {
        return b.toUpperCase().replace(/\s+/g, '_').replace('-', '_');
      });
      whereClause.bodyType = { in: mappedBodyType };
    }

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (eyeColor && eyeColor.length > 0) {
      whereClause.eyeColor = { in: eyeColor };
    }

    if (hairColor && hairColor.length > 0) {
      whereClause.hairColor = { in: hairColor };
    }

    if (skills && skills.length > 0) {
      whereClause.skills = { hasSome: skills };
    }

    // Languages in schema is a relation `languages Language[]`
    // Client sends string array.
    if (languages && languages.length > 0) {
      whereClause.languages = {
        some: {
          name: { in: languages }
        }
      };
    }

    // Experience is String in schema, but client sends range.
    // We can't easily filter string ranges in DB.
    // We might need to fetch and filter in memory or ignore for now if the schema is incompatible.
    // Ignoring experience filter for now to prevent errors.

    console.log('Talent Search WhereClause:', JSON.stringify(whereClause, null, 2));

    const [talents, total] = await Promise.all([
      prisma.talentProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              // profilePicture: true // Not in schema User model?
            }
          },
          category: {
            select: { id: true, name: true }
          },
          subcategory: {
            select: { id: true, name: true }
          },
          portfolio: {
            select: {
              id: true,
              title: true,
              mediaUrl: true,
              type: true,
              thumbnail: true,
              description: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
          // skills is string[] in schema, so it's included by default
        },
        skip,
        take: pageSize,
        orderBy: [
          { viewCount: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.talentProfile.count({ where: whereClause }),
    ]);

    console.log(`Found ${talents.length} talents, total: ${total}`);

    // Transform data to match client expectation
    const transformedTalents = talents.map(talent => ({
      id: talent.userId,
      name: talent.user.name, // For VideoTalentCard
      role: talent.performerTitle || '', // For VideoTalentCard
      title: talent.performerTitle || '',
      description: talent.bio || '',
      priceRange: '', // Not in schema
      ratePerHour: 0, // Not in schema
      location: talent.location || '',
      experienceLevel: 0,
      availability: '', // Not in schema
      
      bookingCount: 0,
      user: {
        id: talent.user.id,
        name: talent.user.name,
        profilePicture: talent.avatarUrl || undefined // Using avatarUrl from profile
      },
      avatarUrl: talent.avatarUrl, // For VideoTalentCard
      videoUrl: talent.videoUrl, // For VideoTalentCard
      category: talent.category?.name || '',
      subcategory: talent.subcategory?.name || '',
      skills: talent.skills || [],
      featuredSkills: (talent as any).featuredSkills || [],
      // Add other fields required by Talent type if needed, or map them in the client
      gender: talent.gender?.toLowerCase() || 'other',
      ethnicity: talent.ethnicity || '',
      age: talent.age || 0,
      height: talent.height || 0,
      bodyType: talent.bodyType?.toLowerCase() || 'average',
      eyeColor: talent.eyeColor || '',
      hairColor: talent.hairColor || '',
      socialMedia: [],
      portfolio: talent.portfolio.map(item => ({
        id: item.id,
        title: item.title,
        mediaUrl: item.mediaUrl,
        type: item.type,
        thumbnail: item.thumbnail || (item.type === 'IMAGE' ? item.mediaUrl : undefined),
        description: item.description || '',
        talentProfile: {
          id: talent.userId,
          user: { name: talent.user.name },
          avatarUrl: talent.avatarUrl,
          category: talent.category ? { name: talent.category.name } : undefined
        },
        views: 0,
        likes: 0,
        isSponsored: false,
        createdAt: item.createdAt.toISOString()
      })),
      isBeginner: talent.isBeginner || false,
      viewCount: talent.viewCount || 0,
      likeCount: talent.likeCount || 0
    }));

    return NextResponse.json({
      success: true,
      talents: transformedTalents,
      total
    });

  } catch (error) {
    console.error('Error in talent search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch talents' },
      { status: 500 }
    );
  }
}
