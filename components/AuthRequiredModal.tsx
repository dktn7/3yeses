'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import SwoopingTick from './SwoopingTick';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  action?: string;
}

const SUPPORTED_LOCALES = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar', 'en'];

const getLocaleFromPath = (path: string): string => {
  const firstSegment = path.split('/').filter(Boolean)[0] || '';
  return SUPPORTED_LOCALES.includes(firstSegment) ? firstSegment : 'en-gb';
};

const buildAuthPath = (mode: 'signin' | 'signup', currentPath: string, locale: string): string => {
  if (mode === 'signup') {
    return `/${locale}/auth/signup/steps/step-1?redirect=${encodeURIComponent(currentPath)}`;
  }
  return `/${locale}/auth/signin?redirect=${encodeURIComponent(currentPath)}`;
};

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'Sign in required',
  message = 'You need an account to perform this action. Continue to sign in or create an account.',
  action = 'this action'
}: AuthRequiredModalProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignIn = () => {
    if (typeof window === 'undefined') return;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const locale = getLocaleFromPath(window.location.pathname);
    onClose();
    router.push(buildAuthPath('signin', currentPath, locale));
  };

  const handleSignUp = () => {
    if (typeof window === 'undefined') return;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const locale = getLocaleFromPath(window.location.pathname);
    onClose();
    router.push(buildAuthPath('signup', currentPath, locale));
  };

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-950/70 backdrop-blur-lg p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-br from-white/95 to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-[0_30px_70px_rgba(0,0,0,0.40)] overflow-hidden">
        <div className="px-6 py-5 border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-blue/10 dark:bg-red-950/30 shadow-md shrink-0">
              <SwoopingTick size={30} className="text-primary-blue dark:text-accent-red" />
            </div>
            <div className="grow">
              <h4 className="text-lg font-bold text-light-surface dark:text-dark-surface">{title || 'Sign in required'}</h4>
              <p className="mt-1 text-sm font-medium text-primary-blue dark:text-accent-red">Your account unlocks talent likes and favorites.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <div className="px-6 py-5 grid grid-cols-12 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="col-span-12 md:col-span-4 h-11 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-light-surface dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleSignIn}
            className="col-span-12 md:col-span-4 h-11 rounded-lg border border-[var(--marketing-pill-border)] text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)] bg-[var(--marketing-pill-bg)] dark:bg-[var(--marketing-pill-bg)] hover-smart-bg transition-colors"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="col-span-12 md:col-span-4 h-11 rounded-lg bg-gradient-to-r from-primary-blue to-indigo-600 dark:from-accent-red dark:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
