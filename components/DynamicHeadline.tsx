import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function DynamicHeadline() {
  const t = useTranslations('Home');
  const headlines = [
    t('headlines.getCast'),
    t('headlines.showcase'),
    t('headlines.connect'),
    t('headlines.build'),
    t('headlines.discover'),
    t('headlines.join'),
    t('headlines.break'),
    t('headlines.passion')
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeOut = () => {
      setIsVisible(false);
    };

    const changeText = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % headlines.length);
      setIsVisible(true);
    };

    const interval = setInterval(() => {
      fadeOut();
      setTimeout(changeText, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h2 className={`text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-8 leading-tight transition-opacity duration-600 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red">
        {headlines[currentIndex]}
      </span>
    </h2>
  );
}
