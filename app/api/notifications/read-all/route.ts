import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AuthService from '@/lib/auth/auth-service';
import { getPrisma } from '@/lib/prisma';

// PATCH - Mark all notifications as read for the authenticated user
export async function PATCH() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { talentProfile: { select: { userId: true } } },
    });
    const talentProfileId = user?.talentProfile?.userId;
    if (!talentProfileId) return NextResponse.json({ message: 'No profile' }, { status: 400 });

    await prisma.talentNotification.updateMany({
      where: { talentProfileId, dismissed: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
