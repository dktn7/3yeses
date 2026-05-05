'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import { Heart, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';

interface SavedTalent {
  id: string;
  name: string;
  category?: string;
  categoryId?: string | null;
  location: string;
  imageUrl?: string;
  savedAt: Date;
  mediaItems?: Array<{ id: string; title?: string; url: string; type: string; thumbnail?: string }>;
}

export default function SavedTalentsPage() {
  const [loading, setLoading] = useState(true);
  const [savedTalents, setSavedTalents] = useState<SavedTalent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = typeof pathname === 'string' ? pathname.split('/')[1] || 'en' : 'en';
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // load categories for filter dropdown
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const list = Array.isArray(json) ? json : (json.categories || json.data || []);
          setCategories(list.map((c: any) => ({ id: c.id, name: c.name })) || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();

    const loadSavedTalents = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Fetch actual saved talents from API
            const savedRes = await fetch('/api/dashboard/saved-talents', { 
              credentials: 'include' 
            });
            if (savedRes.ok) {
              const savedData = await savedRes.json();
              setSavedTalents(savedData.talents || []);
            }
          } else {
            router.push('/auth/signin');
          }
        } else {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Failed to load saved talents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedTalents();
  }, [router]);

  const filteredTalents = filter === 'all'
    ? savedTalents
    : savedTalents.filter(t => (t.categoryId || '') === filter);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/overview`}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('dashboard.backToDashboard')}</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-xl">
                <Heart className="h-8 w-8 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.savedTalents')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {savedTalents.length} {t('dashboard.talentsSaved')}
                </p>
              </div>
            </div>

            {/* Filter dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-light-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              >
                <option value="all">{t('dashboard.allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Talents Grid */}
        {filteredTalents.length === 0 ? (
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('dashboard.noSavedTalents')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('dashboard.startSavingTalents')}
            </p>
            <Link
              href={`/${locale}/talents`}
              className="inline-block bg-primary-blue hover:bg-primary-blue/90 dark:bg-accent-red dark:hover:bg-accent-red/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {t('dashboard.browseTalents')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTalents.map((talent) => {
              const adapted = {
                id: talent.id,
                user: { name: talent.name },
                avatarUrl: (talent as any).imageUrl || '',
                category: { name: talent.category || '' },
                skills: (talent as any).skills || [],
                featuredSkills: (talent as any).featuredSkills || undefined,
              } as any;

              return (
                <FeaturedTalentCard
                  key={talent.id}
                  talent={adapted}
                  mediaItems={(talent as any).mediaItems || []}
                  onMediaClick={(item: any) => {
                    const idTo = item?.talentProfile?.id || talent.id;
                    router.push(`/talent/${idTo}`);
                  }}
                  onProfileClick={(p: any) => router.push(`/talent/${p.userId ?? p.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
