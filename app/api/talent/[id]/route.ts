import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrisma();
  const { id } = await params;

  try {
    // Find by userId (TalentProfile uses `userId` as unique identifier)
    let talent = await prisma.talentProfile.findUnique({
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

    // (No fallback needed; `userId` is the canonical key for TalentProfile)

    if (!talent) {
      return NextResponse.json(
        { error: 'Talent not found' },
        { status: 404 }
      );
    }

    // Portfolio items from PortfolioItem relation (canonical source)
    const portfolioItems = (talent.portfolio || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      mediaUrl: item.mediaUrl,
      type: item.type.toLowerCase(),
      thumbnail: item.thumbnail,
      likeCount: item.likeCount || 0
    }));

    // Transform to Talent type
    const transformedTalent = {
      userId: talent.userId,
      id: talent.userId,
      name: talent.user.name || 'Unknown Talent',
      categoryId: talent.categoryId || null,
      subcategoryId: talent.subcategoryId || null,
      role: talent.performerTitle || talent.subcategory?.name || talent.category?.name || '',
      category: talent.category?.name || '',
      subcategory: talent.subcategory?.name || '',
      skills: talent.skills || [],
      videoUrl: talent.videoUrl || undefined,
      avatarUrl: talent.avatarUrl || undefined,
      bannerUrl: talent.bannerUrl || undefined,
      location: talent.location || '',
      experienceLevel: parseInt(talent.experienceLevel || '0') || 0,
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
      contentBackground: (talent as any).contentBackground || null,
    };

    // Build similarity filters: match by category, overlapping skills, or key characteristics.
    const profileId = talent.userId; // exclude current talent by userId

    const orConditions: any[] = [];
    if (talent.categoryId) orConditions.push({ categoryId: talent.categoryId });
    if (talent.skills && Array.isArray(talent.skills) && talent.skills.length) orConditions.push({ skills: { hasSome: talent.skills } });
    if (talent.bodyType) orConditions.push({ bodyType: talent.bodyType });
    if ((talent.gender as any)) orConditions.push({ gender: talent.gender });

    // Fallback to category match when no other signals are available
    if (orConditions.length === 0 && talent.categoryId) orConditions.push({ categoryId: talent.categoryId });

    const suggestions = await prisma.talentProfile.findMany({
      where: {
        AND: [
          { userId: { not: profileId } },
          { OR: orConditions }
        ]
      },
      take: 6,
      include: {
        user: { select: { name: true } },
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
        portfolio: true
      }
    });

    const transformedSuggestions = suggestions.map(s => ({
      id: s.userId,
      name: s.user.name || 'Unknown',
      role: s.performerTitle || '',
      categoryId: s.categoryId || null,
      subcategoryId: s.subcategoryId || null,
      category: s.category?.name || '',
      subcategory: s.subcategory?.name || '',
      skills: s.skills || [],
      avatarUrl: s.avatarUrl || undefined,
      location: s.location || '',
      experienceLevel: parseInt(s.experienceLevel || '0') || 0,
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
      portfolio: (s.portfolio || []).map((p: any) => ({ id: p.id, title: p.title, mediaUrl: p.mediaUrl, type: p.type.toLowerCase(), thumbnail: p.thumbnail })),
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
