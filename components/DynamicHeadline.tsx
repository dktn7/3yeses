import React, { useState, useEffect } from 'react';

const headlines = [
  "Get cast in your next role today",
  "Showcase your talent to the world",
  "Connect with industry professionals",
  "Build your creative portfolio",
  "Discover new opportunities daily",
  "Join the talent revolution",
  "Your next big break awaits",
  "Turn your passion into success"
];

export default function DynamicHeadline() {
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
