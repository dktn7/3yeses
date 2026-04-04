export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

// GET - Fetch talent profile
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.authenticated || !auth.user) return auth.response!;
    const { userId } = auth.user;

    const profile = await prisma.talentProfile.findUnique({
      where: { userId },
      include: {
        profileSettings: true,
        category: true,
        subcategory: true,
        workHistory: {
          orderBy: { startDate: 'desc' }
        }
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update talent profile
export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateUser(req);
    if (!auth.authenticated || !auth.user) return auth.response!;
    const { userId } = auth.user;
    const body = await req.json();

    const {
      name,
      performerTitle,
      bio,
      location,
      experienceLevel,
      dateOfBirth,
      gender,
      genderOther,
      ethnicity,
      ethnicityOther,
      age,
      height,
      bodyType,
      eyeColor,
      hairColor,
      skills,
      featuredSkills,
      disabilities,
      disabilityOther,
      avatarUrl,
      bannerUrl,
      avatarSource,
      bannerSource,
      videoUrl,
      portfolioImages,
      videoUrls,
      socialMedia,
      workHistory,
      categoryId,
      subcategoryId,
      languages,
      contentBackground,
    } = body;

    // Resolve category and subcategory inputs to real DB ids.
    // The UI may send friendly ids/slugs (e.g. 'actors') or names; try to resolve those.
    let resolvedCategoryId: string | null = categoryId || null;
    let resolvedSubcategoryId: string | null = subcategoryId || null;

    if (categoryId) {
      // Try by id first
      let cat = await prisma.talentCategory.findUnique({ where: { id: categoryId } });
      if (!cat) {
        // Try by name (case-insensitive)
        cat = await prisma.talentCategory.findFirst({ where: { name: { equals: categoryId, mode: 'insensitive' } } });
      }
      if (!cat) {
        return NextResponse.json({ success: false, error: 'Invalid categoryId' }, { status: 400 });
      }
      resolvedCategoryId = cat.id;
    }

    if (subcategoryId) {
      // Try by id first
      let sub = await prisma.talentSubcategory.findUnique({ where: { id: subcategoryId } });
      if (!sub) {
        // If category resolved, search subcategories within that category by name
        if (resolvedCategoryId) {
          sub = await prisma.talentSubcategory.findFirst({ where: { categoryId: resolvedCategoryId, name: { equals: subcategoryId, mode: 'insensitive' } } });
        }
        // Fallback to searching by name globally
        if (!sub) {
          sub = await prisma.talentSubcategory.findFirst({ where: { name: { equals: subcategoryId, mode: 'insensitive' } } });
        }
      }
      if (!sub) {
        return NextResponse.json({ success: false, error: 'Invalid subcategoryId' }, { status: 400 });
      }
      if (resolvedCategoryId && sub.categoryId !== resolvedCategoryId) {
        return NextResponse.json({ success: false, error: 'subcategoryId does not belong to the provided categoryId' }, { status: 400 });
      }
      resolvedSubcategoryId = sub.id;
    }

    // Check if profile exists
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId },
    });

    let profile;

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.talentProfile.update({
        where: { userId },
        data: {
          performerTitle,
          bio,
          location,
          experienceLevel,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          genderOther,
          ethnicity,
          ethnicityOther,
          age,
          height,
          bodyType: bodyType?.toUpperCase(), // Ensure bodyType matches enum
          eyeColor,
          hairColor,
          skills,
          featuredSkills: featuredSkills || [],
          disabilities,
          disabilityOther,
          avatarUrl,
          bannerUrl,
          avatarSource,
          bannerSource,
          videoUrl,
          portfolioImages,
          videoUrls,
          socialMedia,
          categoryId: resolvedCategoryId,
          subcategoryId: resolvedSubcategoryId,
          contentBackground,
          ...(Array.isArray(languages) ? {
            languages: {
              deleteMany: {},
              create: languages.map((lang: { name: string; proficiency: string }) => ({
                name: lang.name,
                proficiency: (lang.proficiency || 'FLUENT') as any,
              } as any)),
            },
          } : {}),
          workHistory: {
            deleteMany: {},
            create: Array.isArray(workHistory) ? workHistory
              .filter((item: any) => item && item.startDate)
              .map((item: any) => ({
                title: item.title,
                company: item.company,
                startDate: new Date(item.startDate),
                ...(item.endDate ? { endDate: new Date(item.endDate) } : {}),
                isCurrent: item.isCurrent,
                description: item.description
              })) : []
          }
        },
      });
    } else {
      // Create new profile
      profile = await prisma.talentProfile.create({
        data: {
          userId,
          performerTitle,
          bio,
          location,
          experienceLevel,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          genderOther,
          ethnicity,
          ethnicityOther,
          age,
          height,
          bodyType: bodyType?.toUpperCase(), // Ensure bodyType matches enum
          eyeColor,
          hairColor,
          skills,
          featuredSkills: featuredSkills || [],
          disabilities,
          disabilityOther,
          avatarUrl,
          bannerUrl,
          avatarSource,
          bannerSource,
          videoUrl,
          portfolioImages,
          videoUrls,
          socialMedia,
          categoryId: resolvedCategoryId,
          subcategoryId: resolvedSubcategoryId,
          contentBackground,
          ...(Array.isArray(languages) ? {
            languages: {
              create: languages.map((lang: string) => ({
                name: lang,
                proficiency: 'FLUENT' as const,
              })),
            },
          } : {}),
          workHistory: {
            create: Array.isArray(workHistory) ? workHistory
              .filter((item: any) => item && item.startDate)
              .map((item: any) => ({
                title: item.title,
                company: item.company,
                startDate: new Date(item.startDate),
                ...(item.endDate ? { endDate: new Date(item.endDate) } : {}),
                isCurrent: item.isCurrent,
                description: item.description
              })) : []
          }
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
