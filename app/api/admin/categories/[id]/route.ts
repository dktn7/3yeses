import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// PATCH update category
async function updateCategory(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  try {
    const body = await request.json();
    const { name, icon } = body;

    if (!name && icon === undefined) {
      return NextResponse.json(
        { error: 'Category name or icon is required' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (name && name.trim()) data.name = name.trim();
    if (icon !== undefined) data.icon = icon || null;

    const category = await prisma.talentCategory.update({
      where: { id },
      data,
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
async function deleteCategory(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  try {
    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    // Check if category has talents via count query
    const talentCount = await prisma.talentProfile.count({ where: { categoryId: id } });

    if (talentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${talentCount} talents. Please reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.talentCategory.delete({ where: { id } });

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
