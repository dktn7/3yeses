import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';

export async function POST() {
  try {
    // Hash the password
    const hashedPassword = await AuthService.hashPassword('Test123!');

    // Upsert test user
    const email = 'test@3yeses.com';
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Dabs Test',
        emailVerified: new Date(),
      },
      create: {
        email,
        name: 'Dabs Test',
        password: hashedPassword,
        role: 'TALENT',
        emailVerified: new Date(),
      },
    });

    // Find Actor category
    const actorCategory = await prisma.category.findFirst({
      where: { name: { contains: 'Actor', mode: 'insensitive' } },
    });

    // Create or update TalentProfile
    const profile = await prisma.talentProfile.upsert({
      where: { userId: user.id },
      update: {
        roleDescription: 'Actor',
        location: 'Birmingham',
        experience: 'Beginner',
        isBeginner: true,
        categoryId: actorCategory?.id || null,
      },
      create: {
        userId: user.id,
        roleDescription: 'Actor',
        location: 'Birmingham',
        experience: 'Beginner',
        isBeginner: true,
        categoryId: actorCategory?.id || null,
      },
    });

    // Ensure at least one portfolio item exists
    const existingItems = await prisma.portfolioItem.count({
      where: { talentProfileId: profile.id },
    });
    if (existingItems === 0) {
      await prisma.portfolioItem.create({
        data: {
          title: 'Sample Audio',
          url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
          type: 'AUDIO',
          talentProfileId: profile.id,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      userId: user.id, 
      profileId: profile.id,
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
