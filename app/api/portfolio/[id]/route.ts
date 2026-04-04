import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';

// GET single portfolio item
export async function GET(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  try {
    const item = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: {
        talentProfile: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Portfolio item fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio item' },
      { status: 500 }
    );
  }
}

// PATCH update portfolio item
export async function PATCH(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check ownership
    const item = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: {
        talentProfile: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    const profileIdOrUserId = (item.talentProfile as any)?.userId ?? (item.talentProfile as any)?.id;
    if (profileIdOrUserId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, url: mediaUrl, type } = body;

    // Update item
    const updatedItem = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(mediaUrl && { mediaUrl }),
        ...(type && { type }),
      },
    });

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Portfolio item updated successfully',
    });
  } catch (error) {
    console.error('Portfolio item update error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// DELETE portfolio item
export async function DELETE(request: NextRequest, context: any) {
  const params = (context && context.params) || { id: undefined };
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check ownership
    const item = await prisma.portfolioItem.findUnique({
      where: { id: params.id },
      include: {
        talentProfile: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    if (item.talentProfile.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete item
    await prisma.portfolioItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    console.error('Portfolio item delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
