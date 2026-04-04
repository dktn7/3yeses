/**
 * Admin endpoint to create missing TalentProfiles for users
 * This is a one-time fix for users who don't have profiles yet
 */
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    // Find all users without talent profiles
    const usersWithoutProfiles = await prisma.user.findMany({
      where: {
        talentProfile: null,
        role: 'TALENT',
      },
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${usersWithoutProfiles.length} users without profiles`);

    // Create profiles for all these users
    const results = await Promise.all(
      usersWithoutProfiles.map((user) =>
        prisma.talentProfile.create({
          data: {
            userId: user.id,
            // Provide minimal required fields
            location: 'Not set',
            experienceLevel: '0',
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Created ${results.length} missing profiles`,
      usersFixed: results.length,
    });
  } catch (error) {
    console.error('Error creating profiles:', error);
    return NextResponse.json(
      { error: 'Failed to create profiles' },
      { status: 500 }
    );
  }
}
