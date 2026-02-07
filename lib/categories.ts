import prisma from '@/lib/prisma';

export interface CategoryWithSubcategories {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  subcategories: Array<{
    id: string;
    name: string;
    description: string | null;
    _count: {
      talentProfiles: number;
    };
  }>;
  _count: {
    talentProfiles: number;
    subcategories: number;
  };
}

// Simple in-memory cache for categories
let categoriesCache: CategoryWithSubcategories[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCategories(): Promise<CategoryWithSubcategories[]> {
  // Return cached data if still valid
  if (categoriesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return categoriesCache;
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
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
      orderBy: {
        name: 'asc',
      },
    });
    
    // Update cache
    categoriesCache = categories;
    cacheTimestamp = Date.now();
    
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// Force refresh cache
export function invalidateCategoriesCache() {
  categoriesCache = null;
  cacheTimestamp = 0;
}
