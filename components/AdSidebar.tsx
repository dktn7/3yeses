'use client';

import { adUnits } from '@/lib/ad-config';
import AdUnit from './AdUnit';

const AdSidebar: React.FC = () => {
  return (
    <aside className="w-56 h-screen sticky top-16 p-4 bg-[var(--chrome-panel)] border-l border-[var(--chrome-border)] overflow-y-auto">
      {/* AdSense-style header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Sponsored</span>
        <span className="text-[9px] text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 rounded px-1">Ads by Google</span>
      </div>
      <div className="space-y-1">
        {adUnits.map((ad) => (
          <AdUnit key={ad.id} ad={ad} />
        ))}
      </div>
    </aside>
  );
};

export default AdSidebar;