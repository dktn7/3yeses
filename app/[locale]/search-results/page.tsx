import SearchResultsClient from './SearchResultsClient';

export default async function SearchResultsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <SearchResultsClient locale={locale} />;
}
