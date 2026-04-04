import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AuthService from '@/lib/auth/auth-service';
import { getPrisma } from '@/lib/prisma';

// PATCH - Mark a single notification as read
export async function PATCH(req: Request, context: any) {
  try {
    const params = context?.params ?? { id: undefined };
    const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
    const id = resolvedParams?.id;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: (decoded as any).userId }, include: { talentProfile: true } });
    const talentProfile = user?.talentProfile as any;
    const talentProfileId = talentProfile?.id ?? talentProfile?.userId;
    if (!talentProfileId) return NextResponse.json({ message: 'No profile' }, { status: 400 });

    const updated = await prisma.talentNotification.updateMany({
      where: { id, talentProfileId, dismissed: false },
      data: { read: true },
    });

    if (updated.count === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
