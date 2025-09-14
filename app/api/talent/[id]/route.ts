import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/auth/middleware';
import { z } from 'zod';
// NOTE: This route returns heterogeneous objects; keep the return untyped NextResponse for now.

const prisma = new PrismaClient();

async function getTalentProfile(id: string) {
  return prisma.talentProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          createdAt: true,
        },
      },
      category: true,
      subcategory: true,
      portfolio: true,
      profileSettings: true,
      reviewsReceived: {
        include: {
          reviewer: {
            select: {
              name: true,
              clientProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

export type TalentProfileWithDetails = NonNullable<
  Awaited<ReturnType<typeof getTalentProfile>>
>;

// GET - Public endpoint to view a single talent profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: talentId } = await params;

    if (!talentId) {
      return NextResponse.json({ talent: {}, suggestions: [] }, { status: 400 });
    }

    // Get talent profile
    const talentProfile = await getTalentProfile(talentId);

    if (!talentProfile) {
      return NextResponse.json({ talent: {}, suggestions: [] }, { status: 404 });
    }

    // Increment view count separately
    await prisma.talentProfile.update({
      where: { id: talentId },
      data: { viewCount: { increment: 1 } },
    });

    // Calculate average rating
    const avgRating = talentProfile.reviewsReceived.length > 0
      ? talentProfile.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / talentProfile.reviewsReceived.length
      : 0;

    // Format the talent data according to the frontend expectations
    const talent = {
      id: talentProfile.id,
      name: talentProfile.user.name,
      role: talentProfile.roleDescription || 'Professional Talent',
      category: talentProfile.category?.name || 'Uncategorized',
      subcategory: talentProfile.subcategory?.name || 'General',
      skills: talentProfile.skills || [],
      videoUrl: talentProfile.videoUrl,
      avatarUrl: talentProfile.avatarUrl,
      location: talentProfile.location || 'Location not specified',
      experience: talentProfile.experience || 0,
      rating: Number(avgRating.toFixed(1)),
  languages: talentProfile.languages || [],
      bio: talentProfile.bio || 'No bio available',
  // availability removed from schema
  availability: 'available',
      gender: talentProfile.gender?.toLowerCase() as 'male' | 'female' | 'non-binary' | 'other' || 'other',
      ethnicity: talentProfile.ethnicity || 'Not specified',
      age: talentProfile.age || 0,
      height: talentProfile.height || 0,
      bodyType: talentProfile.bodyType?.toLowerCase() as 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size' | 'muscular' || 'average',
      eyeColor: talentProfile.eyeColor || 'Not specified',
      hairColor: talentProfile.hairColor || 'Not specified',
      socialMedia: Array.isArray(talentProfile.socialMedia) 
        ? talentProfile.socialMedia as { platform: string; url: string }[]
        : [],
      portfolio: talentProfile.portfolio.map(item => ({
        title: item.title,
        url: item.url,
        type: item.type.toLowerCase() as 'image' | 'video' | 'audio',
      })),
      reviews: talentProfile.reviewsReceived.map(review => ({
        reviewer: review.reviewer.name,
        rating: review.rating,
        comment: review.comment || '',
      })),
      isBeginner: talentProfile.isBeginner,
      viewCount: talentProfile.viewCount + 1,
      profileSettings: talentProfile.profileSettings ? {
        showViewCount: talentProfile.profileSettings.showViewCount,
        showExperienceLevel: talentProfile.profileSettings.showExperienceLevel,
        showLocation: talentProfile.profileSettings.showLocation,
        showLanguages: talentProfile.profileSettings.showLanguages,
        showRating: talentProfile.profileSettings.showRating,
        showReviewCount: talentProfile.profileSettings.showReviewCount,
        showWorkHistory: talentProfile.profileSettings.showWorkHistory,
        showSocialMedia: talentProfile.profileSettings.showSocialMedia,
        showContactInfo: talentProfile.profileSettings.showContactInfo,
        profileVisibility: talentProfile.profileSettings.profileVisibility,
        searchable: talentProfile.profileSettings.searchable,
        allowDirectContact: talentProfile.profileSettings.allowDirectContact,
        showOnlineStatus: talentProfile.profileSettings.showOnlineStatus,
      } : null,
    };

    // Get similar talents for suggestions (same category/subcategory)
    const suggestions = await prisma.talentProfile.findMany({
      where: {
        id: { not: talentId },
        OR: [
          { categoryId: talentProfile.categoryId },
          { subcategoryId: talentProfile.subcategoryId },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        subcategory: {
          select: {
            name: true,
          },
        },
        reviewsReceived: {
          select: {
            rating: true,
          },
        },
      },
      take: 6,
      orderBy: {
        viewCount: 'desc',
      },
    });

    // Format suggestions
    type Suggestion = {
      id: string;
      roleDescription?: string | null;
      skills?: string[] | null;
      videoUrl?: string | null;
      avatarUrl?: string | null;
      location?: string | null;
      experience?: number | null;
      languages?: string[] | null;
      bio?: string | null;
      gender?: string | null;
      ethnicity?: string | null;
      age?: number | null;
      height?: number | null;
      bodyType?: string | null;
      eyeColor?: string | null;
      hairColor?: string | null;
      isBeginner?: boolean | null;
      viewCount?: number | null;
      user?: { name?: string | null } | null;
      category?: { name?: string | null } | null;
      subcategory?: { name?: string | null } | null;
      reviewsReceived?: { rating: number }[] | null;
    };

    const formattedSuggestions = suggestions.map(s => {
      const suggestion = s as unknown as Suggestion;
      const reviews = Array.isArray(suggestion.reviewsReceived) ? suggestion.reviewsReceived : [];
      const suggestionAvgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

      return {
        id: suggestion.id,
        name: suggestion.user?.name || 'Unknown',
        role: suggestion.roleDescription || 'Professional Talent',
        category: suggestion.category?.name || 'Uncategorized',
        subcategory: suggestion.subcategory?.name || 'General',
        skills: suggestion.skills || [],
        videoUrl: suggestion.videoUrl,
        avatarUrl: suggestion.avatarUrl,
        location: suggestion.location || 'Location not specified',
        experience: suggestion.experience || 0,
        rating: Number(suggestionAvgRating.toFixed(1)),
        // pricing removed
        languages: suggestion.languages || [],
        bio: suggestion.bio || 'No bio available',
        availability: 'available',
        gender: (suggestion.gender || 'other').toLowerCase() as 'male' | 'female' | 'non-binary' | 'other',
        ethnicity: suggestion.ethnicity || 'Not specified',
        age: suggestion.age || 0,
        height: suggestion.height || 0,
        bodyType: (suggestion.bodyType || 'average').toLowerCase() as 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size' | 'muscular',
        eyeColor: suggestion.eyeColor || 'Not specified',
        hairColor: suggestion.hairColor || 'Not specified',
        socialMedia: [],
        portfolio: [],
        reviews: [],
        isBeginner: suggestion.isBeginner,
        viewCount: suggestion.viewCount,
      };
    });

    // Return data in the format expected by the frontend
  return NextResponse.json({ talent, suggestions: formattedSuggestions });

  } catch (error) {
    console.error('Error fetching talent profile:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching talent profile.',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// PUT - updating talent profiles requires authentication and more complex
// signature handling; return 501 Not Implemented for now.
export const PUT = withAuth<{ id: string }>(async (request, context, user) => {
  try {
    const talentId = context.params?.id;

    if (!talentId) {
      return NextResponse.json({ success: false, message: 'Missing talent id' }, { status: 400 });
    }

    // Ensure the authenticated user owns this talent profile
    const existing = await prisma.talentProfile.findUnique({ where: { id: talentId }, select: { userId: true } });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Talent profile not found' }, { status: 404 });
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json({ success: false, message: 'You are not authorized to update this profile' }, { status: 403 });
    }

    // Validate input with Zod
    const socialMediaItem = z.object({ platform: z.string().min(1), url: z.string().url() });

    const updateSchema = z.object({
      roleDescription: z.string().max(200).optional(),
      skills: z.array(z.string()).optional(),
      videoUrl: z.string().url().optional(),
      avatarUrl: z.string().url().optional(),
      location: z.string().max(200).optional(),
      experience: z.number().int().min(0).optional(),
      languages: z.array(z.string()).optional(),
      bio: z.string().max(2000).optional(),
      gender: z.enum(['male', 'female', 'non-binary', 'other']).optional(),
      ethnicity: z.string().max(100).optional(),
      age: z.number().int().min(0).optional(),
      height: z.number().optional(),
      bodyType: z.enum(['slim','athletic','average','curvy','plus-size','muscular']).optional(),
      eyeColor: z.string().max(50).optional(),
      hairColor: z.string().max(50).optional(),
      socialMedia: z.array(socialMediaItem).optional(),
      isBeginner: z.boolean().optional(),
  }).refine((d: Record<string, unknown>) => Object.keys(d).length > 0, { message: 'No updatable fields provided' });

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = updateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data as Record<string, unknown>;

    // Perform the update
    await prisma.talentProfile.update({ where: { id: talentId }, data });

    // Return the refreshed full profile (reuse existing getter)
    const refreshed = await getTalentProfile(talentId);
    return NextResponse.json({ success: true, talent: refreshed });
  } catch (error) {
    console.error('Error updating talent profile:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, message: 'Error updating talent profile', error: message }, { status: 500 });
  }
});
