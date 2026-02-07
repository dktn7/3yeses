'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';

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
            const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
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

    const currentLanguage = languages.find((lang) => lang.code === locale);

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
                    />
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                        ref={modalRef}
                        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                Select Language
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                aria-label="Close language switcher"
                            >
                                <svg
                                    className="w-6 h-6"
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${
                                        locale === lang.code
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <Image
                                        src={lang.flag}
                                        alt={lang.name}
                                        width={28}
                                        height={28}
                                        className="rounded-full mr-3"
                                        unoptimized
                                    />
                                    <span className="text-gray-800 dark:text-white font-medium">
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