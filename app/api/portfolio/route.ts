import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';

// GET all portfolio items for authenticated user
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find user's talent profile
    const talentProfile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { success: true, items: [] }
      );
    }

    // Get portfolio items
    const items = await prisma.portfolioItem.findMany({
      where: { talentProfileId: talentProfile.id },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

// POST new portfolio item
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find user's talent profile
    const talentProfile = await prisma.talentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!talentProfile) {
      return NextResponse.json(
        { error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, url, type } = body;

    if (!title || !url || !type) {
      return NextResponse.json(
        { error: 'Title, URL, and type are required' },
        { status: 400 }
      );
    }

    if (!['VIDEO', 'IMAGE', 'AUDIO'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be VIDEO, IMAGE, or AUDIO' },
        { status: 400 }
      );
    }

    // Create portfolio item
    const item = await prisma.portfolioItem.create({
      data: {
        title,
        url,
        type,
        talentProfileId: talentProfile.id,
      },
    });

    return NextResponse.json({
      success: true,
      item,
      message: 'Portfolio item added successfully',
    });
  } catch (error) {
    console.error('Portfolio create error:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}
