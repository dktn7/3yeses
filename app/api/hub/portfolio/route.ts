export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

// Cache portfolio items for 2 minutes
let cachedResponse: any = null;
let cacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Sanitize search input to prevent injection and ensure safety
function sanitizeSearchInput(input: string): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length to prevent abuse
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Remove any null bytes or control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Escape special regex characters if needed (for safe logging/display)
  // Note: Prisma handles SQL injection prevention internally
  
  return sanitized;
}

export async function GET(req: NextRequest) {
  try {
    // Check if bio is requested
    const { searchParams } = new URL(req.url);
    const includeBio = searchParams.get('includeBio') === 'true';
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const page = Math.max(1, Math.min(100, parseInt(searchParams.get('page') || '1'))); // Limit page range
    const limit = Math.max(1, Math.min(200, parseInt(searchParams.get('limit') || '20'))); // Limit items per page
    const search = sanitizeSearchInput(searchParams.get('search') || '');
    const sort = searchParams.get('sort') || 'recent';
    const popularity = searchParams.get('popularity');
    const dateRange = searchParams.get('date');
    
    // Return cached data if still valid AND no filters are applied
    const now = Date.now();
    if (cachedResponse && (now - cacheTime) < CACHE_DURATION && !categoryId && (!type || type === 'all') && !search && !popularity && !dateRange && page === 1 && sort === 'recent') {
      return NextResponse.json(cachedResponse, {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
        },
      });
    }

    const prisma = getPrisma();
    
    const where: any = {};

    if (categoryId && categoryId !== 'all') {
      // Check if it's a parent category
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { subcategories: true }
      });

      if (category) {
        // It's a parent category, include items from this category OR any of its subcategories
        where.talentProfile = {
          OR: [
            { categoryId: categoryId },
            { subcategoryId: { in: category.subcategories.map(s => s.id) } }
          ]
        };
      } else {
        // It might be a subcategory ID directly (though usually we pass parent ID)
        // Or if the ID passed is actually a subcategory ID
        const subcategory = await prisma.subcategory.findUnique({
          where: { id: categoryId }
        });
        
        if (subcategory) {
           where.talentProfile = {
             subcategoryId: categoryId
           };
        }
      }
    }

    if (search) {
      // First, check if the search term matches a category or subcategory name
      const matchingCategory = await prisma.category.findFirst({
        where: { name: { contains: search, mode: 'insensitive' } },
        include: { subcategories: true }
      });
      
      const matchingSubcategory = await prisma.subcategory.findFirst({
        where: { name: { contains: search, mode: 'insensitive' } }
      });
      
      // Build comprehensive search criteria
      const searchConditions: any[] = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { talentProfile: { user: { name: { contains: search, mode: 'insensitive' } } } }
      ];
      
      // If search matches a category, include items from that category
      if (matchingCategory) {
        searchConditions.push({
          talentProfile: {
            OR: [
              { categoryId: matchingCategory.id },
              { subcategoryId: { in: matchingCategory.subcategories.map(s => s.id) } }
            ]
          }
        });
      }
      
      // If search matches a subcategory, include items from that subcategory
      if (matchingSubcategory) {
        searchConditions.push({
          talentProfile: { subcategoryId: matchingSubcategory.id }
        });
      }
      
      // Also search by category/subcategory name in the relation
      searchConditions.push(
        { talentProfile: { category: { name: { contains: search, mode: 'insensitive' } } } },
        { talentProfile: { subcategory: { name: { contains: search, mode: 'insensitive' } } } }
      );
      
      where.OR = searchConditions;
    }

    // Apply Popularity Filter (based on Item View Count)
    if (popularity && popularity !== 'all') {
      let min = 0;
      let max = 2000000000; // Large number

      switch (popularity) {
        case 'viral':
          min = 100000;
          break;
        case 'popular':
          min = 10000;
          max = 100000;
          break;
        case 'rising':
          min = 1000;
          max = 10000;
          break;
        case 'fresh':
          max = 1000;
          break;
      }

      // Use raw query to find IDs because Prisma doesn't support filtering by relation count in 'where' clause
      const popularityIds = await prisma.$queryRaw`
        SELECT p.id
        FROM "PortfolioItem" p
        LEFT JOIN "PortfolioView" v ON p.id = v."portfolioItemId"
        GROUP BY p.id
        HAVING COUNT(v.id) >= ${min} AND COUNT(v.id) < ${max}
      `;

      const ids = (popularityIds as any[]).map((r: any) => r.id);
      
      // If no items match the popularity filter, we should return empty result immediately
      if (ids.length === 0) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          facets: { types: {}, categories: { all: 0 } }
        });
      }

      where.id = { in: ids };
    }

    // Apply Date Range Filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let dateLimit = new Date();
      
      switch (dateRange) {
        case 'today':
          dateLimit.setHours(0, 0, 0, 0);
          break;
        case 'week':
          dateLimit.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateLimit.setDate(now.getDate() - 30);
          break;
        case 'year':
          dateLimit.setDate(now.getDate() - 365);
          break;
      }
      
      where.createdAt = { gte: dateLimit };
    }

    // Base where for facets (excludes type filter)
    const baseWhere = { ...where };

    // Add type filter to main query if present
    if (type && type !== 'all') {
      where.type = type;
    }

    // Where for category facets (excludes category filter, includes type filter)
    const categoryFacetWhere: any = {};
    if (search) {
      categoryFacetWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { talentProfile: { user: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }
    if (type && type !== 'all') {
      categoryFacetWhere.type = type;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'trending':
      case 'views-desc':
        orderBy = { views: { _count: 'desc' } };
        break;
      case 'views-asc':
        orderBy = { views: { _count: 'asc' } };
        break;
      case 'popular':
      case 'likes-desc':
        orderBy = { talentProfile: { likes: { _count: 'desc' } } };
        break;
      case 'likes-asc':
        orderBy = { talentProfile: { likes: { _count: 'asc' } } };
        break;
      case 'comments-desc':
        orderBy = { comments: { _count: 'desc' } };
        break;
      case 'oldest':
      case 'date-asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title-asc':
        orderBy = { title: 'asc' };
        break;
      case 'title-desc':
        orderBy = { title: 'desc' };
        break;
      case 'recent':
      case 'date-desc':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const [items, total, typeCounts, totalAll] = await Promise.all([
      prisma.portfolioItem.findMany({
        where,
        include: {
          talentProfile: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
              subcategory: {
                select: {
                  name: true,
                },
              },
              _count: {
                select: {
                  likes: true
                }
              }
            },
          },
          _count: {
            select: {
              views: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.portfolioItem.count({ where }),
      prisma.portfolioItem.groupBy({
        by: ['type'],
        where: baseWhere,
        _count: {
          _all: true
        }
      }),
      prisma.portfolioItem.count({ where: categoryFacetWhere })
    ]);

    // Format type counts
    const facets = {
      types: typeCounts.reduce((acc, curr) => {
        acc[curr.type] = curr._count._all;
        return acc;
      }, {} as Record<string, number>),
      categories: {
        all: totalAll
      }
    };

    // Calculate views and likes from relationships
    const formattedItems = items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        url: item.url,
        type: item.type,
        thumbnail: undefined, // Thumbnails should be stored separately, not the video URL
        talentProfile: {
          id: item.talentProfile.id,
          user: {
            name: item.talentProfile.user.name,
          },
          avatarUrl: item.talentProfile.avatarUrl,
          bio: includeBio ? item.talentProfile.bio : undefined,
          category: item.talentProfile.category,
          subcategory: item.talentProfile.subcategory,
        },
        views: item._count.views,
        likes: item.talentProfile._count.likes,
        isSponsored: false, // Can add this field to schema later
        createdAt: item.createdAt || new Date(),
      };
    });

    // Update cache only for default view
    if (!categoryId && (!type || type === 'all') && !search && !popularity && !dateRange && page === 1 && sort === 'recent') {
      cachedResponse = {
        items: formattedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        facets
      };
      cacheTime = now;
    }

    return NextResponse.json({
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      facets
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
      },
    });
  } catch (error) {
    console.error('Failed to load portfolio items:', error);
    return NextResponse.json([], { status: 500 });
  }
}
