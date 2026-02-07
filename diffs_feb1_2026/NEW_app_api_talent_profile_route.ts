export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Fetch talent profile
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
      include: {
        languages: true,
        profileSettings: true,
        category: true,
        subcategories: true,
        workHistory: {
          orderBy: {
            startDate: 'desc'
          }
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
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await req.json();

    const {
      name,
      roleDescription,
      bio,
      location,
      experience,
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
      videoUrl,
      portfolioImages,
      videoUrls,
      socialMedia,
      workHistory,
      languages,
    } = body;

    // Check if profile exists
    const existingProfile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    let profile;

    if (name) {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { name },
      });
    }

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.talentProfile.update({
        where: { userId: decoded.userId },
        data: {
          roleDescription,
          bio,
          location,
          experience,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
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
          featuredSkills: featuredSkills || [],
          disabilities,
          disabilityOther,
          avatarUrl,
          bannerUrl,
          videoUrl,
          portfolioImages,
          videoUrls,
          socialMedia,
          languages: {
            deleteMany: {},
            create: Array.isArray(languages) ? languages.map((lang: string) => ({
              name: lang,
              proficiency: 'FLUENT'
            })) : []
          },
          workHistory: {
            deleteMany: {},
            create: Array.isArray(workHistory) ? workHistory.map((item: any) => ({
              title: item.title,
              company: item.company,
              startDate: new Date(item.startDate),
              endDate: item.endDate ? new Date(item.endDate) : null,
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
          userId: decoded.userId,
          roleDescription,
          bio,
          location,
          experience,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
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
          featuredSkills: featuredSkills || [],
          disabilities,
          disabilityOther,
          avatarUrl,
          bannerUrl,
          videoUrl,
          portfolioImages,
          videoUrls,
          socialMedia,
          languages: {
            create: Array.isArray(languages) ? languages.map((lang: string) => ({
              name: lang,
              proficiency: 'FLUENT'
            })) : []
          },
          workHistory: {
            create: Array.isArray(workHistory) ? workHistory.map((item: any) => ({
              title: item.title,
              company: item.company,
              startDate: new Date(item.startDate),
              endDate: item.endDate ? new Date(item.endDate) : null,
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
