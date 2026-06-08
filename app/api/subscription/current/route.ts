export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const prisma = getPrisma();

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({
        plan: null,
        status: 'NONE',
        features: ['Basic profile', 'Limited portfolio (3 items)', 'Standard search visibility'],
      });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({
        plan: null,
        status: 'NONE',
        features: ['Basic profile', 'Limited portfolio (3 items)', 'Standard search visibility'],
      });
    }

    // Get user's current active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: decoded.userId,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      // Return no active subscription
      return NextResponse.json({
        plan: null,
        status: 'NONE',
        features: ['Basic profile', 'Limited portfolio (3 items)', 'Standard search visibility'],
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
