'use client';

import Image from 'next/image';
import { AdUnit as AdUnitData } from '@/lib/ad-config';

interface AdUnitProps {
  ad: AdUnitData;
}

const AdUnit: React.FC<AdUnitProps> = ({ ad }) => {
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ad.headline}
      className="group block mb-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface shadow-sm hover:shadow-md hover:bg-primary-blue dark:hover:bg-accent-red hover:border-blue-300 dark:hover:border-red-600 transition-all duration-200"
    >
      {/* Photo */}
      <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <Image
          src={ad.imageUrl}
          alt={ad.altText}
          fill
          sizes="300px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="p-3 space-y-1">
        {/* Headline */}
        <p className="text-sm font-bold leading-snug text-light-surface dark:text-dark-surface group-hover:text-white dark:group-hover:text-white">
          {ad.headline}
        </p>

        {/* Body copy */}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
          {ad.body}
        </p>

        {/* Footer row: host + CTA + Ad badge */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-green-700 dark:text-green-400 font-medium truncate max-w-[120px]">
            {ad.host}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-blue-700 dark:text-red-400 font-semibold hover:underline">
              {ad.cta}
            </span>
            <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 rounded px-1 py-px">
              Ad
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default AdUnit;