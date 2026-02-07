'use client';

import Image from 'next/image';

// Minimal AdUnitData type inlined to avoid missing export from '@/lib/ad-config'
interface AdUnitData {
  id?: string;
  imageUrl: string;
  linkUrl: string;
  altText?: string;
}

interface AdUnitProps {
  ad: AdUnitData;
}

const AdUnit: React.FC<AdUnitProps> = ({ ad }) => {
  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-4 transition-transform duration-200 hover:scale-105"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <Image
          src={ad.imageUrl}
          alt={ad.altText || ''}
          width={300}
          height={200}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>
    </a>
  );
};

export default AdUnit;