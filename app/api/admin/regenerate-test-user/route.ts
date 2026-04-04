import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';

export async function POST() {
  try {
    // Hash the password
    const hashedPassword = await AuthService.hashPassword('Test123!');

    // Upsert test user
    const email = 'test@3yeses.online';
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Dabs Test',
        emailVerified: new Date(),
      },
      // Cast create payload to any to satisfy generator types in this dev-only helper
      create: {
        email,
        name: 'Dabs Test',
        password: hashedPassword,
        role: 'TALENT',
        emailVerified: new Date(),
      } as any,
    });

    // Find Actor category
    const actorCategory = await prisma.talentCategory.findFirst({
      where: { name: { contains: 'Actor', mode: 'insensitive' } },
    });

    // Create or update TalentProfile
    const profile = await prisma.talentProfile.upsert({
      where: { userId: user.id },
      update: {
        performerTitle: 'Actor',
        location: 'Birmingham',
        experienceLevel: 'Beginner',
        isBeginner: true,
        categoryId: actorCategory?.id || null,
      },
      create: {
        userId: user.id,
        performerTitle: 'Actor',
        location: 'Birmingham',
        experienceLevel: 'Beginner',
        isBeginner: true,
        categoryId: actorCategory?.id || null,
      },
    });

    // Ensure at least one portfolio item exists
    const profileId = (profile as any).id ?? (profile as any).userId;
    const existingItems = await prisma.portfolioItem.count({
      where: { talentProfileId: profileId },
    });
    if (existingItems === 0) {
      await prisma.portfolioItem.create({
        data: {
          title: 'Sample Audio',
          mediaUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
          type: 'AUDIO',
          talentProfileId: profileId,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      userId: user.id, 
      profileId: profileId,
      email: email,
      password: 'Test123!',
      message: 'Test user regenerated: Dabs Test from Birmingham, Beginner Actor'
    });
  } catch (error) {
    console.error('Regenerate test user error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to regenerate test user' 
      }, 
      { status: 500 }
    );
  }
}
