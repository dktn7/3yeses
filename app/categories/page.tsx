import { PrismaClient } from '@prisma/client';
import CategoriesClientNew from './CategoriesClientNew';

const prisma = new PrismaClient();

interface CategoryWithSubcategories {
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

// Server Component that fetches real data from database
export default async function CategoriesPage() {
  try {
    const categories: CategoryWithSubcategories[] = await prisma.category.findMany({
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

  return <CategoriesClientNew categories={categories} />;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Fallback to empty array if database fails
  return <CategoriesClientNew categories={[]} />;
  }
}