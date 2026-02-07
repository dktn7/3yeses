import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    
    // Get all skills from talent profiles
    const profiles = await prisma.talentProfile.findMany({
      select: { skills: true }
    });

    // Collect all unique skills
    const skillsSet = new Set<string>();
    profiles.forEach(profile => {
      if (Array.isArray(profile.skills)) {
        profile.skills.forEach(skill => {
          if (typeof skill === 'string' && skill.trim()) {
            skillsSet.add(skill.trim());
          }
        });
      }
    });

    const uniqueSkills = Array.from(skillsSet).sort();

    return NextResponse.json({
      success: true,
      skills: uniqueSkills,
      total: uniqueSkills.length
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills', details: String(error) },
      { status: 500 }
    );
  }
}
