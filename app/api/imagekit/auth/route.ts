import { NextResponse } from 'next/server';
import { getAuthenticationParameters, IMAGEKIT_PUBLIC_KEY } from '@/lib/upload/imagekit-config';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

// GET /api/imagekit/auth
// Returns authentication parameters for client-side direct uploads to ImageKit.
// Requires an authenticated user session.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const authParams = getAuthenticationParameters();

    return NextResponse.json({
      ...authParams,
      publicKey: IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
