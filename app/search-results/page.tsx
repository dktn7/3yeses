import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import VideoTalentCard from '@/components/VideoTalentCard';

interface SearchResultsProps {
  categories: Array<{ id: string; name: string; description: string; subcategories: Array<{ id: string; name: string }> }>;
  subcategories: Array<{ id: string; name: string; description: string }>;
  talentProfiles: Array<{
    id: string;
    name: string;
    role: string;
    category: string;
    subcategory: string;
    skills: string[];
    location: string;
    experience: number;
    rating: number;
    bio: string;
    languages: string[];
    gender: 'male' | 'female' | 'non-binary' | 'other';
    ethnicity: string;
    age: number;
    height: number;
    eyeColor: string;
    hairColor: string;
    availability: string[];
    bodyType: 'slim' | 'athletic' | 'average' | 'curvy' | 'plus-size' | 'muscular';
    socialMedia: Array<{ platform: string; url: string }>;
    portfolio: Array<{ title: string; url: string; type: 'audio' | 'video' | 'image' }>;
    reviews: Array<{ reviewer: string; comment: string; rating: number }>;
    awards: string[];
    isBeginner: boolean;
    viewCount: number;
    likeCount: number;
  }>;
}

const SearchResults: React.FC = () => {
  const [categories, setCategories] = useState<SearchResultsProps['categories']>([]);
  const [subcategories, setSubcategories] = useState<SearchResultsProps['subcategories']>([]);
  const [talentProfiles, setTalentProfiles] = useState<SearchResultsProps['talentProfiles']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = searchParams.get('q') || '';
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const data = await response.json();
        setCategories(data.categories || []);
        setSubcategories(data.subcategories || []);
        setTalentProfiles(data.talentProfiles || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Search Results
        </h1>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
            <ul className="space-y-4">
              {categories.map((category) => (
                <li key={category.id} className="p-4 border rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{category.description}</p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.id}>{subcategory.name}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Subcategories</h2>
            <ul className="space-y-4">
              {subcategories.map((subcategory) => (
                <li key={subcategory.id} className="p-4 border rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{subcategory.name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{subcategory.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Talent Profiles Section */}
        {talentProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Talent Profiles</h2>
            <ul className="space-y-4">
              {talentProfiles.map((profile) => (
                <li key={profile.id} className="p-4 border rounded-lg shadow-md">
                  <VideoTalentCard talent={profile} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No Results Section */}
        {categories.length === 0 && subcategories.length === 0 && talentProfiles.length === 0 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h2>
            <p className="text-sm text-gray-700 dark:text-gray-200">Try refining your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
