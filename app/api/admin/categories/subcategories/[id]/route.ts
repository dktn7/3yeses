import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// PATCH update subcategory
async function updateSubcategory(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Subcategory name is required' },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      subcategory,
      message: 'Subcategory updated successfully',
    });
  } catch (error) {
    console.error('Subcategory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

// DELETE subcategory
async function deleteSubcategory(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if subcategory has talents
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { talents: true },
        },
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    if (subcategory._count.talents > 0) {
      return NextResponse.json(
        { error: `Cannot delete subcategory with ${subcategory._count.talents} talents. Please reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.subcategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.error('Subcategory delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}

export const PATCH = withAdminAuth(updateSubcategory);
export const DELETE = withAdminAuth(deleteSubcategory);
