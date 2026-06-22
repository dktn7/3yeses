import { useTranslations, useLocale } from 'next-intl';
import CMSContent from '@/components/CMSContent';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildLocalizedPath } from '@/lib/locale-path';

export default function ContactPage() {
  const tNav = useTranslations('Navigation');
  const locale = useLocale();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumbs items={[{ label: tNav('home'), href: buildLocalizedPath(locale, '/') }, { label: tNav('contact') }]} />
      </div>
      <CMSContent slug="contact" />
    </>
  );
}
