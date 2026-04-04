// app/[locale]/categories/[categoryId]/page.tsx
// This route is deprecated. Redirect to the new categories page with query params.
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Props {
  params: { locale: string; categoryId: string };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, categoryId } = params;

  // Look up category name by ID so we can redirect with the correct query param
  try {
    const category = await prisma.talentCategory.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });

    if (category) {
      redirect(`/${locale}/categories?category=${encodeURIComponent(category.name)}`);
    }
  } catch {
    // If lookup fails, just redirect to categories index
  }

  redirect(`/${locale}/categories`);
}