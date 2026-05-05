export const dynamic = 'force-dynamic';

import CategoriesClientNew from './CategoriesClientNew';
import { getCategories } from '@/lib/categories';
// Server Component that fetches real data from database
export default async function CategoriesPage({ params }: { params: { locale: string } }) {
  // Force a fresh read from the database to ensure removed categories no longer appear
  const categories = await getCategories(true);

  return (
    <CategoriesClientNew categories={categories} params={params} />
  );
}