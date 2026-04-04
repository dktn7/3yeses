import CMSContent from '@/components/CMSContent';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ContactPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
      </div>
      <CMSContent slug="contact" />
    </>
  );
}
