import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AuthService from '@/lib/auth/auth-service';
import { getPrisma } from '@/lib/prisma';

// DELETE - Soft-dismiss a notification for the authenticated user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const decoded = AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { talentProfile: { select: { id: true } } },
    });
    const talentProfileId = user?.talentProfile?.id;
    if (!talentProfileId) return NextResponse.json({ message: 'No profile' }, { status: 400 });

    const updated = await prisma.notification.updateMany({
      where: { id: params.id, talentProfileId },
      data: { dismissed: true, read: true },
    });

    if (updated.count === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
