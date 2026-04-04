// Categories API
// GET /api/categories - Get all categories with subcategories

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ApiResponse } from '@/lib/api-types';
import { getCachedCategories, warmCaches, serverCache } from '@/lib/cache-warmer';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

// GET - Fetch all categories with subcategories
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const includeTalent = searchParams.get('includeTalent') === 'true';

    // Check pre-warmed cache first (for all categories request)
    if (!categoryId && !includeTalent) {
      const cached = getCachedCategories();
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
        });
      }
    }

    if (categoryId) {
      // Get specific category with its subcategories and talent
      const category = await prisma.talentCategory.findUnique({
        where: { id: categoryId },
        include: {
          subcategories: {
            include: {
                  talentProfiles: includeTalent ? {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  } : false,
              _count: {
                select: {
                  talentProfiles: true,
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
          },
          _count: {
            select: {
              talentProfiles: true,
              subcategories: true,
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: 'Category not found',
            error: 'Category not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: category,
      });
    }

    // Get all categories - use centralized cache if available
    const cached = getCachedCategories();
    if (!categoryId && cached) {
      return NextResponse.json({
        success: true,
        data: cached,
      });
    }

    const categories = await prisma.talentCategory.findMany({
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            talentProfiles: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      talentCount: category._count.talentProfiles,
      subcategories: category.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
      })),
    }));

    // Update centralized cache if fetching all categories
    if (!categoryId) {
      serverCache.categories = formattedCategories;
      serverCache.categoriesTimestamp = Date.now();
    }

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
