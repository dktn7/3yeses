'use client';

import React, { useEffect, useRef } from 'react';

interface PropellerAdProps {
  zoneId: string;
  className?: string;
  fallbackText?: string;
  type?: 'banner' | 'native' | 'video' | 'popup';
}

declare global {
  interface Window {
    propellerads: any;
    propellerads_queue: any[];
  }
}

export default function PropellerAd({
  zoneId,
  className = '',
  fallbackText = 'Advertisement',
  type = 'banner'
}: PropellerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adId = `propeller-ad-${zoneId}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    // Load Propeller Ads script if not already loaded
    if (!window.propellerads && !window.propellerads_queue) {
      window.propellerads_queue = [];
      window.propellerads = {
        push: function(item: any) {
          window.propellerads_queue.push(item);
        }
      };

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://uppromote.com/zone/js/zone.js';
      script.onload = () => {
        if (window.propellerads_queue) {
          window.propellerads_queue.forEach((item) => {
            if (window.propellerads.push) {
              window.propellerads.push(item);
            }
          });
          window.propellerads_queue = [];
        }
      };
      document.head.appendChild(script);
    }

    // Add ad to queue
    if (window.propellerads && window.propellerads.push) {
      window.propellerads.push({
        zoneId: zoneId,
        id: adId,
        type: type
      });
    } else if (window.propellerads_queue) {
      window.propellerads_queue.push({
        zoneId: zoneId,
        id: adId,
        type: type
      });
    }
  }, [zoneId, adId, type]);

  const adStyles = {
    banner: 'min-h-[250px] bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center',
    native: 'min-h-[100px] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center',
    video: 'min-h-[300px] bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center',
    popup: 'hidden'
  };

  return (
    <div className={`propeller-ad-container ${className}`}>
      {/* Ad Placeholder */}
      <div
        ref={adRef}
        id={adId}
        className={`${adStyles[type]} w-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700`}
      >
        <div className="text-center p-4">
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            📢 {fallbackText}
          </div>
          <div className="text-gray-400 dark:text-gray-500 text-xs">
            Zone ID: {zoneId}
          </div>
          <div className="text-gray-300 dark:text-gray-600 text-xs mt-1">
            Loading advertisement...
          </div>
        </div>
      </div>

      {/* Native Ad Style for better integration */}
      {type === 'native' && (
        <style jsx>{`
          .propeller-ad-container {
            position: relative;
          }
          .propeller-ad-container::before {
            content: 'Ad';
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.1);
            color: rgba(0, 0, 0, 0.6);
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 3px;
            z-index: 10;
          }
        `}</style>
      )}
    </div>
  );
}