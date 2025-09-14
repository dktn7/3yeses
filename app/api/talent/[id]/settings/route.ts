import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { withAuth } from '@/lib/auth/middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const profileSettingsSchema = z.object({
  showViewCount: z.boolean().optional(),
  showExperienceLevel: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showLanguages: z.boolean().optional(),
  showRating: z.boolean().optional(),
  showReviewCount: z.boolean().optional(),
  showWorkHistory: z.boolean().optional(),
  showSocialMedia: z.boolean().optional(),
  showContactInfo: z.boolean().optional(),
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'CONTACTS_ONLY']).optional(),
  searchable: z.boolean().optional(),
  allowDirectContact: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
});

export const PUT = withAuth<{ id: string }>(async (request, context, user) => {
  try {
    const talentId = context.params?.id;
    if (!talentId) {
      return NextResponse.json({ success: false, message: 'Missing talent id' }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.talentProfile.findUnique({ where: { id: talentId }, select: { userId: true } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Talent profile not found' }, { status: 404 });
    }
    if (existing.userId !== user.userId) {
      return NextResponse.json({ success: false, message: 'You are not authorized to update this profile settings' }, { status: 403 });
    }

    const raw = await request.json().catch(() => null);
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }

    const parsed = profileSettingsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data as Prisma.ProfileSettingsUpdateInput;

    // Upsert ProfileSettings for this talent
    const upserted = await prisma.profileSettings.upsert({
      where: { talentProfileId: talentId },
      update: data,
      create: {
        ...parsed.data,
        talentProfile: { connect: { id: talentId } },
      },
    });

    return NextResponse.json({ success: true, profileSettings: upserted });
  } catch (error) {
    console.error('Error updating profile settings:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, message: 'Error updating profile settings', error: message }, { status: 500 });
  }
});
