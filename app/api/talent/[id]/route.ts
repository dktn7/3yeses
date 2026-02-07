import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const prisma = getPrisma();
  const id = params.id;

  try {
    // Try to find by talentProfile.id first, then fallback to userId
    let talent = await prisma.talentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: {
          select: { id: true, name: true }
        },
        subcategory: {
          select: { id: true, name: true }
        },
        portfolio: true,
        workHistory: {
          orderBy: {
            startDate: 'desc'
          }
        },
        languages: true,
      }
    });

    // If not found by profileId, try by userId
    if (!talent) {
      talent = await prisma.talentProfile.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          category: {
            select: { id: true, name: true }
          },
          subcategory: {
            select: { id: true, name: true }
          },
          portfolio: true,
          workHistory: {
            orderBy: {
              startDate: 'desc'
            }
          },
          languages: true,
        }
      });
    }

    if (!talent) {
      return NextResponse.json(
        { error: 'Talent not found' },
        { status: 404 }
      );
    }

    // Combine portfolio items from relation and legacy arrays
    const portfolioItems = [
      ...(talent.portfolio || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        type: item.type.toLowerCase(),
        thumbnail: item.thumbnail,
        likes: item.likes || 0
      })),
      ...(talent.portfolioImages || []).map((url: string) => ({
        id: url,
        title: 'Portfolio Image',
        url: url,
        type: 'image',
        likes: 0
      })),
      ...(talent.videoUrls || []).map((url: string) => ({
        id: url,
        title: 'Portfolio Video',
        url: url,
        type: 'video',
        likes: 0
      }))
    ];

    // Transform to Talent type
    const transformedTalent = {
      userId: talent.userId,
      id: talent.id,
      name: talent.user.name || 'Unknown Talent',
      role: talent.roleDescription || '',
      category: talent.category?.name || '',
      subcategory: talent.subcategory?.name || '',
      skills: talent.skills || [],
      videoUrl: talent.videoUrl || undefined,
      avatarUrl: talent.avatarUrl || undefined,
      bannerUrl: talent.bannerUrl || undefined,
      location: talent.location || '',
      experience: parseInt(talent.experience || '0') || 0,
      rating: talent.rating || 0,
      languages: (talent.languages || []).map((l: any) => l.name),
      bio: talent.bio || '',
      gender: (talent.gender as any) || 'other',
      ethnicity: (talent.ethnicity as any) || '',
      age: talent.age || 0,
      height: talent.height || 0,
      bodyType: (talent.bodyType as any) || 'average',
      eyeColor: talent.eyeColor || '',
      hairColor: talent.hairColor || '',
      socialMedia: (talent.socialMedia as any) || [],
      portfolio: portfolioItems,
      workHistory: talent.workHistory || [],
      reviews: [], // Fetch if needed
      isBeginner: talent.isBeginner || false,
      viewCount: talent.viewCount || 0,
      likeCount: talent.likeCount || 0,
      isLiked: false, // Needs auth context or separate call
    };

    // Fetch suggestions (same category, excluding current)
    const suggestions = await prisma.talentProfile.findMany({
      where: {
        categoryId: talent.categoryId,
        id: { not: id }
      },
      take: 4,
      include: {
        user: { select: { name: true } },
        category: { select: { name: true } },
        subcategory: { select: { name: true } }
      }
    });

    const transformedSuggestions = suggestions.map(s => ({
      id: s.id,
      name: s.user.name || 'Unknown',
      role: s.roleDescription || '',
      category: s.category?.name || '',
      subcategory: s.subcategory?.name || '',
      skills: s.skills || [],
      avatarUrl: s.avatarUrl || undefined,
      location: s.location || '',
      experience: parseInt(s.experience || '0') || 0,
      rating: s.rating || 0,
      languages: [],
      bio: s.bio || '',
      gender: (s.gender as any) || 'other',
      ethnicity: (s.ethnicity as any) || '',
      age: s.age || 0,
      height: s.height || 0,
      bodyType: (s.bodyType as any) || 'average',
      eyeColor: s.eyeColor || '',
      hairColor: s.hairColor || '',
      socialMedia: [],
      portfolio: [],
      reviews: [],
      isBeginner: s.isBeginner || false,
      viewCount: s.viewCount || 0,
      likeCount: s.likeCount || 0
    }));

    return NextResponse.json({
      talent: transformedTalent,
      suggestions: transformedSuggestions
    });

  } catch (error) {
    console.error('Error fetching talent:', error);
    return NextResponse.json(
      { error: 'Internal Server Error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
