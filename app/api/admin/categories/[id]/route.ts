import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// PATCH update category
async function updateCategory(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE category
async function deleteCategory(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has talents
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { talents: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category._count.talents > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.talents} talents. Please reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

export const PATCH = withAdminAuth(updateCategory);
export const DELETE = withAdminAuth(deleteCategory);
