import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/middleware/adminAuth';

// Default icon assignments based on category name keywords
const CATEGORY_ICON_MAP: Record<string, string> = {
  'acting': 'Star',
  'performance': 'Star',
  'comedy': 'Smile',
  'dancing': 'Activity',
  'choreography': 'Activity',
  'dance': 'Activity',
  'modeling': 'Camera',
  'model': 'Camera',
  'music': 'Music',
  'audio': 'Headphones',
  'singing': 'Mic',
  'voice': 'Mic',
  'sports': 'Zap',
  'fitness': 'Zap',
  'stunts': 'Award',
  'stunt': 'Award',
  'film': 'Film',
  'cinema': 'Film',
  'video': 'Video',
  'art': 'Palette',
  'visual': 'Paintbrush',
  'hosting': 'Megaphone',
  'presenting': 'Megaphone',
  'tv': 'Tv',
  'television': 'Tv',
  'influencer': 'Globe',
  'social': 'Globe',
  'fashion': 'Sparkles',
  'beauty': 'Heart',
  'circus': 'Sparkles',
  'magic': 'Sparkles',
};

function getDefaultIcon(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  for (const [keyword, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return 'Star'; // Fallback icon
}

// GET all categories with subcategories
async function getCategories(request: NextRequest) {
  try {
    const categories = await prisma.talentCategory.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { talentProfiles: true },
            },
          },
        },
        _count: {
          select: { talentProfiles: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform _count to match frontend expectations and auto-assign icons
    const transformed = categories.map(cat => ({
      ...cat,
      icon: cat.icon || getDefaultIcon(cat.name),
      _count: { talents: cat._count.talentProfiles },
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        _count: { talents: sub._count.talentProfiles },
      })),
    }));

    // Auto-save icons for categories that don't have one yet
    const unsetCategories = categories.filter(cat => !cat.icon);
    if (unsetCategories.length > 0) {
      await Promise.all(
        unsetCategories.map(cat =>
          prisma.talentCategory.update({
            where: { id: cat.id },
            data: { icon: getDefaultIcon(cat.name) },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      categories: transformed,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST new category
async function createCategory(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await prisma.talentCategory.findFirst({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await prisma.talentCategory.create({
      data: { name: name.trim(), icon: icon || getDefaultIcon(name.trim()) },
    });

    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getCategories);
export const POST = withAdminAuth(createCategory);
