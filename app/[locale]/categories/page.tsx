import CategoriesPageContent from '@/app/categories/page';

export default function CategoriesPage({ params }: { params: { locale: string } }) {
  return (
    <div>
      <CategoriesPageContent params={params} />
    </div>
  );
}