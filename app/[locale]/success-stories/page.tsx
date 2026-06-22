import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildLocalizedPath } from '@/lib/locale-path';

const STORIES = [
  {
    titleKey: 'stories.0.title',
    bodyKey: 'stories.0.body',
  },
  {
    titleKey: 'stories.1.title',
    bodyKey: 'stories.1.body',
  },
  {
    titleKey: 'stories.2.title',
    bodyKey: 'stories.2.body',
  },
];

export default async function SuccessStoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? 'en-gb';
  const t = await getTranslations('SuccessStories');
  const tNav = await getTranslations('Navigation');

  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red isolate">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <Breadcrumbs items={[{ label: tNav('home'), href: buildLocalizedPath(locale, '/') }, { label: t('breadcrumb') }]} />

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">{t('subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STORIES.map((story) => (
            <div key={story.titleKey} className="marketing-surface rounded-lg border shadow-md p-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t(story.titleKey)}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t(story.bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const locales = ['en-gb', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'ru-RU', 'zh-CN', 'ja-JP', 'ar'];
  return locales.map((locale) => ({
    locale,
  }));
}
