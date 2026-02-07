/**
 * Cache Warmer - Pre-loads frequently accessed data on server startup
 * This improves first-request performance by avoiding cold cache hits
 */

import prisma from '@/lib/prisma';

let isWarmed = false;

// Cache storage
export const serverCache = {
  categories: null as any,
  categoriesTimestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function warmCaches() {
  if (isWarmed) return;
  
  console.log('🔥 Warming server caches...');
  
  try {
    // Pre-load categories
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { talentProfiles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    serverCache.categories = categories.map(category => ({
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
    serverCache.categoriesTimestamp = Date.now();
    
    isWarmed = true;
    console.log(`✅ Cache warmed: ${categories.length} categories loaded`);
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
}

export function getCachedCategories() {
  if (serverCache.categories && Date.now() - serverCache.categoriesTimestamp < CACHE_TTL) {
    return serverCache.categories;
  }
  return null;
}

export function invalidateCache(key: 'categories' | 'all') {
  if (key === 'categories' || key === 'all') {
    serverCache.categories = null;
    serverCache.categoriesTimestamp = 0;
  }
}
