import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// POST new subcategory
async function createSubcategory(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Subcategory name is required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if subcategory already exists in this category
    const existing = await prisma.talentSubcategory.findFirst({
      where: {
        name: name.trim(),
        categoryId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Subcategory already exists in this category' },
        { status: 400 }
      );
    }

    const subcategory = await prisma.talentSubcategory.create({
      data: {
        name: name.trim(),
        categoryId,
      },
    });

    return NextResponse.json({
      success: true,
      subcategory,
      message: 'Subcategory created successfully',
    });
  } catch (error) {
    console.error('Subcategory create error:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}

export const POST = withAdminAuth(createSubcategory);
