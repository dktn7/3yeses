export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AuthService from '@/lib/auth/auth-service';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 200 }
      );
    }

    // Verify the token
    const decoded = await AuthService.verifyJWT(accessToken);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 200 }
      );
    }

    // Get user from database
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        talentProfile: {
          select: {
            userId: true,
            performerTitle: true,
            profileComplete: true,
            avatarUrl: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        emailVerified: !!user.emailVerified,
        profileComplete: user.talentProfile?.profileComplete || false,
        avatarUrl: user.talentProfile?.avatarUrl || null,
        talentProfile: user.talentProfile
          ? {
              userId: user.talentProfile.userId,
              performerTitle: user.talentProfile.performerTitle,
            }
          : null,
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
