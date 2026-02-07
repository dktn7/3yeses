'use client';

import { adUnits } from '@/lib/ad-config';
import AdUnit from './AdUnit';

const AdSidebar: React.FC = () => {
  console.log('AdSidebar is rendering'); // Debug log
  
  return (
    <aside className="w-48 h-screen sticky top-16 p-4 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      <h2 className="text-lg font-semibold text-primary-blue dark:text-accent-red mb-4 text-center">Sponsored</h2>
      <div className="space-y-4">
        {adUnits.map((ad) => (
          <AdUnit key={ad.id} ad={ad} />
        ))}
        {/* Fallback content to ensure visibility */}
      </div>
    </aside>
  );
};

export default AdSidebar;