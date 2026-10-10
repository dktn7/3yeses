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
      <div className={`rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))] shadow-[0_24px_60px_-34px_rgba(15,23,42,0.48)] backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-800/70 dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(17,24,39,0.92))] ${
        isExpanded ? 'p-4' : 'p-3'
      }`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-primary),color-mix(in_srgb,var(--brand-primary)_72%,#1d4ed8))] p-2.5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-22px_rgba(37,99,235,0.9)]"
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
            <div className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Theme
            </div>
            <div className="flex justify-center">
              <ModeToggle />
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"></div>

          {/* Social Media */}
          <div>
            <div className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Follow Us
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                className="group flex items-center justify-center rounded-xl border border-slate-200/70 bg-[color-mix(in_srgb,var(--brand-primary)_10%,white)] p-3 text-[var(--brand-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--brand-primary)]/30 hover:bg-[color-mix(in_srgb,var(--brand-primary)_16%,white)] dark:border-slate-800/70 dark:bg-[color-mix(in_srgb,var(--brand-primary)_16%,#111827)] dark:text-red-100 dark:hover:bg-[color-mix(in_srgb,var(--brand-primary)_24%,#111827)]"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="group flex items-center justify-center rounded-xl border border-slate-200/70 bg-sky-50 p-3 text-sky-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100 dark:border-slate-800/70 dark:bg-red-950/25 dark:text-red-300 dark:hover:bg-red-950/45"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="group flex items-center justify-center rounded-xl border border-slate-200/70 bg-[var(--marketing-pill-bg)] p-3 text-[var(--marketing-pill-icon)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 dark:border-slate-800/70 dark:bg-[var(--marketing-pill-bg)] dark:text-[var(--marketing-pill-icon)]"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button"
                className="group flex items-center justify-center rounded-xl border border-slate-200/70 bg-[color-mix(in_srgb,var(--brand-primary)_10%,white)] p-3 text-[var(--brand-primary)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--brand-primary)]/30 hover:bg-[color-mix(in_srgb,var(--brand-primary)_16%,white)] dark:border-slate-800/70 dark:bg-[color-mix(in_srgb,var(--brand-primary)_16%,#111827)] dark:text-red-100 dark:hover:bg-[color-mix(in_srgb,var(--brand-primary)_24%,#111827)]"
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
                className="rounded-lg border border-slate-200/70 bg-[color-mix(in_srgb,var(--brand-primary)_10%,white)] p-1.5 text-[var(--brand-primary)] transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--brand-primary)_16%,white)] dark:border-slate-800/70 dark:bg-[color-mix(in_srgb,var(--brand-primary)_16%,#111827)] dark:text-red-100 dark:hover:bg-[color-mix(in_srgb,var(--brand-primary)_24%,#111827)]"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-3 h-3" />
              </button>
              <button 
                type="button"
                className="rounded-lg border border-slate-200/70 bg-[var(--marketing-pill-bg)] p-1.5 text-[var(--marketing-pill-icon)] transition-all duration-200 hover:brightness-105 dark:border-slate-800/70 dark:bg-[var(--marketing-pill-bg)] dark:text-[var(--marketing-pill-icon)]"
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
