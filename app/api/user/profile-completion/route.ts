export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/middleware';
import { getPrisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define the type for user with talent profile
type UserWithTalentProfile = Prisma.UserGetPayload<{
  select: {
    name: true;
    email: true;
    role: true;
    talentProfile: {
      select: {
        bio: true;
        location: true;
        avatarUrl: true;
        skills: true;
        languages: { select: { id: true } };
        experience: true;
        portfolioImages: true;
        videoUrls: true;
        portfolio: { select: { id: true; type: true } };
      };
    };
  };
}>;

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.userId;
    const prisma = getPrisma();

    // Fetch user profile data with explicit typing
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        role: true,
        talentProfile: {
          select: {
            bio: true,
            location: true,
            avatarUrl: true,
            skills: true,
            languages: {
              select: { id: true }
            },
            experience: true,
            portfolioImages: true,
            videoUrls: true,
            portfolio: {
              select: { id: true, type: true }
            }
          }
        }
      }
    }) as UserWithTalentProfile | null;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize tracking
    let percentage = 0;
    const missingFields: string[] = [];

    // For TALENT users, calculate profile completion
    if (user.role === 'TALENT' && user.talentProfile) {
      const profile = user.talentProfile;
      
      // Count videos separately (portfolio items with type VIDEO)
      const videoCount = profile.portfolio?.filter(item => item.type === 'VIDEO').length || 0;
      
      const fields = {
        bio: { value: profile.bio, weight: 10, label: 'Add bio' },
        location: { value: profile.location, weight: 10, label: 'Add location' },
        avatarUrl: { value: profile.avatarUrl, weight: 10, label: 'Upload profile picture' },
        skills: { value: profile.skills?.length > 0, weight: 15, label: 'Add skills' },
        languages: {
          value: profile.languages?.length > 0,
          weight: 10,
          label: 'Add languages',
        },
        experience: { value: profile.experience, weight: 10, label: 'Add experience' },
        portfolio: {
          value: profile.portfolio?.length > 0,
          weight: 15,
          label: 'Add portfolio items',
        },
        videos: {
          value: videoCount > 0,
          weight: 20,
          label: 'Add videos',
        },
      };

      // Calculate completion
      for (const [key, field] of Object.entries(fields)) {
        if (field.value) {
          percentage += field.weight;
        } else {
          missingFields.push(field.label);
        }
      }
    }

    return NextResponse.json({
      percentage,
      missingFields,
      isComplete: percentage === 100,
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile completion' },
      { status: 500 }
    );
  }
}
