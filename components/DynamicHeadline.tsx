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
  }, [headlines.length]);

  return (
    <h2 className={`marketing-hero-title text-4xl md:text-6xl font-bold mb-8 leading-tight transition-opacity duration-600 dark:[text-shadow:0_6px_22px_rgba(0,0,0,0.34)] ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <span className="marketing-dynamic-headline">{headlines[currentIndex]}</span>
    </h2>
  );
}
