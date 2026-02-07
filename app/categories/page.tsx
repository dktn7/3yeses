export const dynamic = 'force-dynamic';

import CategoriesClientNew from './CategoriesClientNew';
import { getCategories } from '@/lib/categories';

// Server Component that fetches real data from database
export default async function CategoriesPage({ params }: { params: { locale: string } }) {
  const categories = await getCategories();

  return <CategoriesClientNew categories={categories} params={params} />;
}