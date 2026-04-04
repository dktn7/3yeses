import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// PATCH update subcategory
async function updateSubcategory(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Subcategory name is required' },
        { status: 400 }
      );
    }

    if (!id) return NextResponse.json({ error: 'Missing subcategory id' }, { status: 400 });

    const subcategory = await prisma.talentSubcategory.update({
      where: { id },
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
async function deleteSubcategory(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;

  try {
    if (!id) return NextResponse.json({ error: 'Missing subcategory id' }, { status: 400 });

    // Check if subcategory has talents via count
    const talentCount = await prisma.talentProfile.count({ where: { subcategoryId: id } });

    if (talentCount > 0) {
      return NextResponse.json({ error: `Cannot delete subcategory with ${talentCount} talents. Please reassign them first.` }, { status: 400 });
    }

    await prisma.talentSubcategory.delete({ where: { id } });

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
