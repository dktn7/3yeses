import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

const DISABILITY_VALUE_MAP: Record<string, string[]> = {
  wheelchair: ['wheelchair', 'Wheelchair User', 'WHEELCHAIR_USER'],
  visual: ['visual', 'Visual Impairment', 'Visual Impairment/Blindness'],
  hearing: ['hearing', 'Hearing Impairment', 'Hearing Impairment/Deafness'],
  mobility: ['mobility', 'Mobility Impairment', 'Mobility Aid', 'Wheelchair User'],
  limb_difference: ['limb_difference', 'Limb Difference', 'Limb Difference/Amputation'],
  dwarfism: ['dwarfism', 'Dwarfism'],
  other: ['other', 'Other'],
};

function toCsvList(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function mapEthnicity(value: string): string {
  const lower = value.toLowerCase();
  if (lower === 'white') return 'WHITE_CAUCASIAN';
  if (lower === 'black/african' || lower === 'black') return 'BLACK_AFRICAN';
  if (lower === 'hispanic/latino') return 'HISPANIC_LATINO';
  if (lower === 'asian') return 'ASIAN';
  if (lower === 'middle eastern') return 'MIDDLE_EASTERN';
  if (lower === 'mixed race' || lower === 'mixed') return 'MIXED_MULTIRACIAL';
  if (lower === 'other') return 'OTHER';
  return value.toUpperCase().replace(/[\s/-]/g, '_');
}

function mapDisabilities(values: string[]): string[] {
  const mapped = values.flatMap((value) => {
    const key = value.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
    return DISABILITY_VALUE_MAP[key] || [value];
  });
  return Array.from(new Set(mapped));
}

export async function GET(request: Request) {
  const prisma = getPrisma();
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const categories = toCsvList(searchParams.get('categories'));
    const subcategory = searchParams.get('subcategory');
    const subcategories = toCsvList(searchParams.get('subcategories'));
    const query = searchParams.get('q');
    const location = searchParams.get('location');
    const gender = toCsvList(searchParams.get('gender'));
    const bodyType = toCsvList(searchParams.get('bodyType'));
    const ethnicity = toCsvList(searchParams.get('ethnicity'));
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    const minExp = searchParams.get('minExp');
    const maxExp = searchParams.get('maxExp');
    const eyeColor = toCsvList(searchParams.get('eyeColor'));
    const hairColor = toCsvList(searchParams.get('hairColor'));
    const skills = toCsvList(searchParams.get('skills'));
    const languages = toCsvList(searchParams.get('languages'));
    const disabilities = toCsvList(searchParams.get('disabilities'));
    const sortBy = searchParams.get('sortBy') || 'relevance';

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    // Apply filters based on query parameters
    if (category) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { categoryId: category },
            { category: { name: { equals: category, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    if (categories.length > 0) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            ...categories.map((id) => ({ categoryId: id })),
            ...categories.map((name) => ({ category: { name: { equals: name, mode: 'insensitive' } } }))
          ]
        }
      ];
    }
    
    if (subcategory) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { subcategoryId: subcategory },
            { subcategory: { name: { equals: subcategory, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    if (subcategories.length > 0) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            ...subcategories.map((id) => ({ subcategoryId: id })),
            ...subcategories.map((name) => ({ subcategory: { name: { equals: name, mode: 'insensitive' } } }))
          ]
        }
      ];
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

    if (ethnicity.length > 0) {
      whereClause.ethnicity = { in: ethnicity.map(mapEthnicity) };
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

    if (minExp || maxExp) {
      // experienceLevel is stored as string labels in database, so map numeric bounds to the appropriate buckets.
      const min = minExp ? parseInt(minExp) : 0;
      const max = maxExp ? parseInt(maxExp) : Number.MAX_SAFE_INTEGER;

      const experienceBuckets: Array<{ label: string; min: number; max: number }> = [
        { label: 'Beginner', min: 0, max: 2 },
        { label: 'Intermediate', min: 3, max: 5 },
        { label: 'Advanced', min: 6, max: 10 },
        { label: 'Expert', min: 11, max: Number.MAX_SAFE_INTEGER }
      ];

      const selectedBuckets = experienceBuckets
        .filter((bucket) => !(max < bucket.min || min > bucket.max))
        .map((bucket) => ({ experienceLevel: { contains: bucket.label, mode: 'insensitive' } }));

      if (selectedBuckets.length > 0) {
        whereClause.AND = [
          ...(whereClause.AND || []),
          { OR: selectedBuckets }
        ];
      }
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

    if (disabilities.length > 0) {
      whereClause.disabilities = { hasSome: mapDisabilities(disabilities) };
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
            select: { id: true, name: true, icon: true }
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
      // explicit profileId (user id) for client routing
      profileId: (talent as any).userId,
      name: (talent as any).user?.name || '',
      role: talent.performerTitle || '',
      title: talent.performerTitle || '',
      description: talent.bio || '',
      location: talent.location || '',
      // rating removed per platform decision
      avatarUrl: talent.avatarUrl,
      videoUrl: talent.videoUrl,
      category: talent.category?.name || '',
      categoryIcon: talent.category?.icon || null,
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
      languages,
      disabilities
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

    if (disabilities && disabilities.length > 0) {
      whereClause.disabilities = { hasSome: mapDisabilities(disabilities) };
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

    if (experienceLevel && typeof experienceLevel === 'object') {
      const min = (experienceLevel as any).min;
      const max = (experienceLevel as any).max;
      if (min !== undefined || max !== undefined) {
        whereClause.experienceLevel = {};
        if (min !== undefined) whereClause.experienceLevel.gte = min;
        if (max !== undefined) whereClause.experienceLevel.lte = max;
      }
    }

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
            select: { id: true, name: true, icon: true }
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
      // explicit profileId (user id) for client routing
      profileId: talent.userId,
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
      categoryIcon: talent.category?.icon || null,
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
