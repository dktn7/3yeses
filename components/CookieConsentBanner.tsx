'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import useFocusTrap from '@/hooks/useFocusTrap';

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('consent');
  const [preferences, setPreferences] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false,
  });

  useFocusTrap(modalRef, showModal);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }

    // Listen for custom event to reopen cookie settings
    const handleReopenCookies = () => {
      const storedConsent = localStorage.getItem('cookie-consent');
      if (storedConsent) {
        setPreferences(JSON.parse(storedConsent));
      }
      setShowModal(true);
    };

    window.addEventListener('open-cookie-settings', handleReopenCookies);
    return () => window.removeEventListener('open-cookie-settings', handleReopenCookies);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowModal(false);
  };

  const handleDeny = () => {
    const deniedPreferences = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(deniedPreferences));
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    const acceptedPreferences = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(acceptedPreferences));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowModal(true);
  };

  // Only hide completely if both banner and modal are closed
  if (!showBanner && !showModal) {
    return null;
  }

  return (
    <>
      {showBanner && (
        <div
          aria-hidden={showModal || undefined}
          className={`ui-consent-layer pointer-events-none fixed inset-x-0 bottom-0 flex justify-center p-4 sm:justify-end sm:p-6 ${showModal ? 'hidden' : ''}`}
        >
          <section aria-labelledby="cookie-consent-title" className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-gray-200 bg-light-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-dark-surface">
            <button
              type="button"
              onClick={handleDeny}
              className="absolute right-3 top-3 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Close cookie notice and continue with necessary cookies"
            >
              <X size={18} />
            </button>
            {/* Logo and Title */}
            <div className="mb-4 flex items-center gap-3 pr-8">
              <div className="w-10 h-10 bg-primary-blue dark:bg-accent-red rounded-lg flex items-center justify-center flex-shrink-0 p-1.5">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="4" fill="transparent" />
                  <path d="M14 24L20 30L34 16" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div>
                <h3 id="cookie-consent-title" className="text-lg font-bold text-gray-900 dark:text-white">We care about your privacy</h3>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">
              3YESES uses cookies to enhance your experience, show you relevant talent profiles, and analyze how you use our platform. By clicking "Accept all cookies", you consent to our use of cookies.
            </p>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleAcceptAll} 
                className="w-full px-5 py-2.5 rounded-lg text-white bg-primary-blue dark:bg-accent-red hover:opacity-90 font-semibold text-sm transition-opacity"
              >
                Accept all cookies
              </button>
              <button 
                onClick={handleDeny} 
                className="w-full px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-sm transition-colors"
              >
                Reject all cookies
              </button>
              <button 
                onClick={handleCustomize} 
                className="w-full px-5 py-2.5 text-primary-blue dark:text-accent-red hover:underline font-semibold text-sm"
              >
                Manage preferences
              </button>
            </div>
          </section>
        </div>
      )}
      {showModal && createPortal((
        <div className="ui-consent-layer fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setShowModal(false)} aria-label="Close cookie preferences" />
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title" className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-light-surface p-6 shadow-2xl dark:bg-dark-surface sm:p-8">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label="Close cookie preferences"
            >
              <X size={20} />
            </button>
            {/* Modal Header with Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-blue dark:bg-accent-red rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="4" fill="transparent" />
                  <path d="M14 24L20 30L34 16" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div>
                <h2 id="cookie-preferences-title" className="text-2xl font-bold text-gray-900 dark:text-white">Cookie Preferences</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">3YESES Talent Platform</p>
              </div>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`py-3 px-6 text-base font-semibold transition-colors ${
                  activeTab === 'consent' 
                    ? 'border-b-2 border-primary-blue dark:border-accent-red text-primary-blue dark:text-accent-red' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('consent')}
              >
                Consent
              </button>
              <button
                className={`py-3 px-6 text-base font-semibold transition-colors ${
                  activeTab === 'about' 
                    ? 'border-b-2 border-primary-blue dark:border-accent-red text-primary-blue dark:text-accent-red' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
            </div>
            {activeTab === 'consent' && (
              <div>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Choose which cookies you want to allow. You can change these settings at any time.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex-1">
                      <label htmlFor="necessary" className="font-semibold text-gray-900 dark:text-white block mb-1">Necessary</label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Required for the site to function properly</p>
                    </div>
                    <input
                      type="checkbox"
                      id="necessary"
                      checked={preferences.necessary}
                      disabled
                      className="h-5 w-5 rounded accent-primary-blue dark:accent-accent-red text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex-1">
                      <label htmlFor="preferences" className="font-semibold text-gray-900 dark:text-white block mb-1">Preferences</label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Remember your settings and preferences</p>
                    </div>
                    <input
                      type="checkbox"
                      id="preferences"
                      checked={preferences.preferences}
                      onChange={() => handleToggle('preferences')}
                      className="h-5 w-5 rounded accent-primary-blue dark:accent-accent-red text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex-1">
                      <label htmlFor="statistics" className="font-semibold text-gray-900 dark:text-white block mb-1">Statistics</label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Help us understand how you use the platform</p>
                    </div>
                    <input
                      type="checkbox"
                      id="statistics"
                      checked={preferences.statistics}
                      onChange={() => handleToggle('statistics')}
                      className="h-5 w-5 rounded accent-primary-blue dark:accent-accent-red text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex-1">
                      <label htmlFor="marketing" className="font-semibold text-gray-900 dark:text-white block mb-1">Marketing</label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Show you relevant casting opportunities and talent</p>
                    </div>
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={preferences.marketing}
                      onChange={() => handleToggle('marketing')}
                      className="h-5 w-5 rounded accent-primary-blue dark:accent-accent-red text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'about' && (
              <div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  3YESES is a platform connecting talented individuals with the World. 
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We use cookies to enhance your browsing experience, personalize content, show you relevant talent profiles and casting opportunities, and analyze our traffic. By clicking "Save Preferences", you consent to our use of cookies according to your selections.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={handleDeny}
                className="px-6 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-dark-surface hover:opacity-90 font-semibold transition-opacity"
              >
                Deny
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-lg text-white bg-primary-blue dark:bg-accent-red hover:opacity-90 font-semibold transition-opacity"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </>
  );
};

export default CookieConsentBanner;
