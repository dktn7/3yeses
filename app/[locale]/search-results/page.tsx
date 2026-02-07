import SearchResultsClient from './SearchResultsClient';

export default function SearchResultsPage({ params }: { params: { locale: string } }) {
  return <SearchResultsClient locale={params.locale} />;
}
