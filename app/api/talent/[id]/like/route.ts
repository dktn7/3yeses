import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  const prisma = getPrisma();
  if (!id) return NextResponse.json({ error: 'Missing talent id' }, { status: 400 });

  try {
    // find talent profile by userId (TalentProfile uses userId as unique key)
    let talent = await prisma.talentProfile.findUnique({ where: { userId: id }, select: { userId: true, likeCount: true } });
    if (!talent) return NextResponse.json({ success: false, error: 'Talent not found' }, { status: 404 });

    // compute likeCount and whether current user liked
    const likeCount = await prisma.profileLike.count({ where: { talentProfileId: talent.userId } });

    // check token for current user (optional — don't require auth for GET)
    let isLiked = false;
    const auth = await authenticateUser(request);
    if (auth.authenticated && auth.user) {
      try {
        const existing = await prisma.profileLike.findUnique({ where: { userId_talentProfileId: { userId: auth.user.userId, talentProfileId: talent.userId } } });
        isLiked = !!existing;
      } catch (err) {
        // ignore token errors — treat as anonymous
      }
    }

    return NextResponse.json({ success: true, likeCount, isLiked });
  } catch (error) {
    console.error('Error in GET like:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  const prisma = getPrisma();
  if (!id) return NextResponse.json({ error: 'Missing talent id' }, { status: 400 });

  try {
    const body = await request.json().catch(() => ({}));
    const likeRequested = Boolean(body.like);

    // authenticate
    const auth = await authenticateUser(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.user.userId;

    // find talent profile by userId (TalentProfile uses userId as unique key)
    let talent = await prisma.talentProfile.findUnique({ where: { userId: id }, select: { userId: true } });
    if (!talent) return NextResponse.json({ success: false, error: 'Talent not found' }, { status: 404 });

    const existing = await prisma.profileLike.findUnique({ where: { userId_talentProfileId: { userId, talentProfileId: talent.userId } } });

    if (likeRequested) {
      if (!existing) {
        await prisma.profileLike.create({ data: { userId, talentProfileId: talent.userId } });
        await prisma.talentProfile.update({ where: { userId: talent.userId }, data: { likeCount: { increment: 1 } as any } });

        // create a notification for the talent owner
        try {
          const actor = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
          const path = `/talent/${talent.userId}`;

          const title = actor?.name ? `${actor.name} liked your profile` : 'Someone liked your profile';
          const message = actor?.name ? `${actor.name} liked your talent profile.` : 'Someone liked your talent profile.';

          await prisma.talentNotification.create({
            data: {
              userId: talent.userId,
              talentProfileId: talent.userId,
              type: 'PROFILE_LIKE',
              title,
              message,
              metadata: { actorId: userId, path },
            } as any,
          });
        } catch (nerr) {
          console.error('Failed to create like notification:', nerr);
        }
      }
    } else {
      if (existing) {
        await prisma.profileLike.delete({ where: { id: existing.id } });
        await prisma.talentProfile.update({ where: { userId: talent.userId }, data: { likeCount: { decrement: 1 } as any } });
      }
    }

    const likeCount = await prisma.profileLike.count({ where: { talentProfileId: talent.userId } });
    return NextResponse.json({ success: true, likeCount, isLiked: likeRequested });
  } catch (error) {
    console.error('Error in POST like:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
