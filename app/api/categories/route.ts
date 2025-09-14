// Categories API
// GET /api/categories - Get all categories with subcategories

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse } from '@/types/api';

const prisma = new PrismaClient();

// GET - Fetch all categories with subcategories
export async function GET(request: Request): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const includeTalent = searchParams.get('includeTalent') === 'true';

    if (categoryId) {
      // Get specific category with its subcategories and talent
      const category = await prisma.category.findUnique({
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

    // Get all categories
    const categories = await prisma.category.findMany({
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
