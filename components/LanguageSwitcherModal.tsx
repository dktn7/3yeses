'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { localizeCurrentPath, normalizeLocale } from '@/lib/locale-path';

const languages = [
    { code: 'en-gb', name: 'English', flag: '/flags/gb.svg' },
    { code: 'fr-FR', name: 'Français', flag: '/flags/fr.svg' },
    { code: 'de-DE', name: 'Deutsch', flag: '/flags/de.svg' },
    { code: 'es-ES', name: 'Español', flag: '/flags/es.svg' },
    { code: 'it-IT', name: 'Italiano', flag: '/flags/it.svg' },
    { code: 'pt-PT', name: 'Português', flag: '/flags/pt.svg' },
    { code: 'ru-RU', name: 'Русский', flag: '/flags/ru.svg' },
    { code: 'ja-JP', name: '日本語', flag: '/flags/jp.svg' },
    { code: 'zh-CN', name: '中文', flag: '/flags/cn.svg' },
    { code: 'ar', name: 'العربية', flag: '/flags/sa.svg' },
];

export default function LanguageSwitcherModal() {
    const [isOpen, setIsOpen] = useState(false);
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const modalRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (newLocale: string) => {
        if (pathname) {
            const newPath = localizeCurrentPath(normalizeLocale(newLocale), pathname);
            router.replace(newPath);
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const currentLanguage = languages.find((lang) => normalizeLocale(lang.code) === normalizeLocale(locale));

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:outline-none"
                aria-label="Open language switcher"
            >
                {currentLanguage && (
                    <Image
                        src={currentLanguage.flag}
                        alt={currentLanguage.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized
                        style={{ width: 'auto', height: 'auto' }}
                    />
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        ref={modalRef}
                        className="bg-light-surface dark:bg-dark-surface rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 w-full max-w-xs mx-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 fade-in duration-200"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                                Select Language
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                aria-label="Close language switcher"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2 justify-items-center">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`relative group/lang flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                                        normalizeLocale(locale) === normalizeLocale(lang.code)
                                            ? 'bg-[var(--brand-primary)]/10 dark:bg-[rgba(185,28,28,0.20)] ring-2 ring-blue-500 dark:ring-red-400 scale-110'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                                    }`}
                                    title={lang.name}
                                >
                                    <Image
                                        src={lang.flag}
                                        alt={lang.name}
                                        width={28}
                                        height={28}
                                        className="rounded-full"
                                        unoptimized
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-medium rounded-md opacity-0 group-hover/lang:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                        {lang.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
