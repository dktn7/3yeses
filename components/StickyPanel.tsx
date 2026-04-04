'use client';

import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { ModeToggle } from './ThemeToggle.tsx';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function StickyPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show panel after scrolling down 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out ${
        isExpanded ? 'p-4' : 'p-3'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-blue-500 to-red-500 dark:from-red-500 dark:to-blue-500 text-white hover:shadow-lg transition-all duration-200 mb-3"
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
        }`}>
          {/* Theme Toggle */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">
              Theme
            </div>
            <div className="flex justify-center">
              <ModeToggle />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mb-4"></div>

          {/* Social Media */}
          <div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
              Follow Us
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 flex items-center justify-center group"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all duration-200 flex items-center justify-center group"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all duration-200 flex items-center justify-center group"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200 flex items-center justify-center group"
                aria-label="Connect with us on LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Mode - Always visible icons */}
        <div className={`transition-all duration-300 ${
          isExpanded ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100'
        }`}>
          <div className="flex items-center justify-center space-x-2">
            {/* Mini Theme Toggle */}
            <div className="scale-75">
              <ModeToggle />
            </div>
            
            {/* Mini Social Icons */}
            <div className="flex space-x-1">
              <button 
                type="button"
                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-200"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-3 h-3" />
              </button>
              <button 
                type="button"
                className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-all duration-200"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
