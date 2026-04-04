export const dynamic = 'force-dynamic';

import CategoriesClientNew from './CategoriesClientNew';
import { getCategories } from '@/lib/categories';
import Breadcrumbs from '@/components/Breadcrumbs';

// Server Component that fetches real data from database
export default async function CategoriesPage({ params }: { params: { locale: string } }) {
  // Force a fresh read from the database to ensure removed categories no longer appear
  const categories = await getCategories(true);
  const locale = params?.locale ?? 'en-gb';

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumbs items={[{ label: 'Home', href: `/${locale}` }, { label: 'Categories' }]} />
      </div>
      <CategoriesClientNew categories={categories} params={params} />
    </>
  );
}