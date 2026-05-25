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
      <div className={`rounded-2xl border border-[var(--chrome-border)] bg-[var(--chrome-panel)] backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out ${
        isExpanded ? 'p-4' : 'p-3'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-blue to-accent-red p-2 text-white transition-all duration-200 hover:shadow-lg"
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
                className="group flex items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 p-3 text-[var(--brand-primary)] transition-all duration-200 hover:bg-[var(--brand-primary)]/18 dark:bg-[var(--brand-primary)]/14 dark:text-red-100 dark:hover:bg-[var(--brand-primary)]/24"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="p-3 rounded-xl bg-sky-50 dark:bg-red-900/20 text-sky-600 dark:text-red-400 hover:bg-sky-100 dark:hover:bg-red-900/40 transition-all duration-200 flex items-center justify-center group"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="p-3 rounded-xl bg-[var(--marketing-pill-bg)] dark:bg-[var(--marketing-pill-bg)] text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)] hover:brightness-105 transition-all duration-200 flex items-center justify-center group"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="group flex items-center justify-center rounded-xl bg-[var(--brand-primary)]/10 p-3 text-[var(--brand-primary)] transition-all duration-200 hover:bg-[var(--brand-primary)]/18 dark:bg-[var(--brand-primary)]/14 dark:text-red-100 dark:hover:bg-[var(--brand-primary)]/24"
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
                className="rounded-lg bg-[var(--brand-primary)]/10 p-1.5 text-[var(--brand-primary)] transition-all duration-200 hover:bg-[var(--brand-primary)]/18 dark:bg-[var(--brand-primary)]/14 dark:text-red-100 dark:hover:bg-[var(--brand-primary)]/24"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-3 h-3" />
              </button>
              <button 
                type="button"
                className="p-1.5 rounded-lg bg-[var(--marketing-pill-bg)] dark:bg-[var(--marketing-pill-bg)] text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)] hover:brightness-105 transition-all duration-200"
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
