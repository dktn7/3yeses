'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Mail, BookOpen, Shield, ChevronDown, ChevronsLeft, ChevronsRight, Grid } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import TikTokIcon from './icons/TikTokIcon';
import Tooltip from './Tooltip';
import { useTranslations } from 'next-intl';

export default function Sidebar({ isCollapsed = false, setIsCollapsed }: { isCollapsed?: boolean, setIsCollapsed?: (isCollapsed: boolean) => void }) {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const popoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const t = useTranslations('Navigation');

    // Get current locale from pathname, handling both locale-based and auth routes
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const validLocales = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];
    const firstSegment = pathSegments[0] || 'en-gb';
    // If first segment is not a valid locale (e.g., 'auth'), default to 'en-gb'
    const locale = validLocales.includes(firstSegment) ? firstSegment : 'en-gb';

    // Create nav items using translations with locale-aware links
    const navItems = [
        { href: `/${locale}`, icon: Home, label: t('home') },
        { href: `/${locale}/about`, icon: BookOpen, label: t('about') },
        { href: `/${locale}/categories`, icon: List, label: t('categories') },
        { href: `/${locale}/hub`, icon: Grid, label: 'Hub' },
        { href: `/${locale}/contact`, icon: Mail, label: t('contact') }
    ];

    // Create dynamic dropdown items based on auth status with locale-aware links
    const getDropdownItems = () => [
        {
            icon: BookOpen,
            label: t('resources'),
            items: [
                { href: `/${locale}/pricing`, label: t('pricingPlans') },
            ]
        },
        {
            icon: Shield,
            label: t('legal'),
            items: [
                { href: `/${locale}/privacy`, label: t('privacyPolicy') },
                { href: `/${locale}/terms`, label: t('termsOfService') },
            ]
        }
    ];

    // Check authentication status
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (openDropdown && !target.closest('.dropdown-item')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    // Close dropdown on route change
    useEffect(() => {
        setOpenDropdown(null);
    }, [pathname]);

    const handleDropdownClick = (label: string) => {
        if (!isCollapsed) {
            setOpenDropdown(openDropdown === label ? null : label);
        }
    };

    const handleMouseEnter = (label: string) => {
        if (isCollapsed) {
            if (popoverTimeout.current) {
                clearTimeout(popoverTimeout.current);
            }
            if (dropdownRefs.current[label]) {
                const rect = dropdownRefs.current[label]!.getBoundingClientRect();
                setPopoverPosition({
                    top: rect.top + window.scrollY,
                    left: rect.right + window.scrollX,
                });
            }
            setPopoverOpen(label);
        }
    };

    const handleMouseLeave = () => {
        if (isCollapsed) {
            popoverTimeout.current = setTimeout(() => {
                setPopoverOpen(null);
            }, 200); // A small delay to allow moving mouse into popover
        }
    };



    return (
        <aside className={`bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white flex flex-col py-6 px-4 transition-all duration-300 fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 overflow-y-auto ${isCollapsed ? 'w-20' : 'w-60'}`}>
            <div className="flex items-center justify-end mb-6">
           </div>
            <nav className="space-y-6 flex-1">
                <div className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors duration-200 ${pathname === item.href ? 'bg-gray-300 dark:bg-gray-800 font-semibold text-primary-blue dark:text-accent-red' : 'text-gray-800 dark:text-white'}`}
                        >
                            {isCollapsed ? (
                                <Tooltip text={item.label}>
                                    <item.icon className="h-5 w-5" />
                                </Tooltip>
                            ) : (
                                <>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </Link>
                    ))}
                </div>
                <div className="space-y-2">
                    {getDropdownItems().map((dropdown) => (
                        <div
                            key={dropdown.label}
                            ref={el => { dropdownRefs.current[dropdown.label] = el; }}
                            className="relative dropdown-item"
                            onMouseEnter={() => handleMouseEnter(dropdown.label)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button
                                onClick={() => handleDropdownClick(dropdown.label)}
                                className={`flex items-center justify-between w-full py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors duration-200 ${openDropdown === dropdown.label ? 'bg-gray-300 dark:bg-gray-800 font-semibold text-primary-blue dark:text-accent-red' : 'text-gray-800 dark:text-white'}`}
                            >
                                <div className="flex items-center space-x-2">
                                    <dropdown.icon className="h-5 w-5" />
                                    {!isCollapsed && <span>{dropdown.label}</span>}
                                </div>
                                {!isCollapsed && <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === dropdown.label ? 'rotate-180' : ''}`} />}
                            </button>
                            {isCollapsed && popoverOpen === dropdown.label &&
    ReactDOM.createPortal(
        <div
            className="absolute w-48 bg-gray-100 dark:bg-gray-800 rounded-md shadow-lg p-2 z-50 border border-gray-200 dark:border-gray-700"
            style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
            onMouseEnter={() => handleMouseEnter(dropdown.label)}
            onMouseLeave={handleMouseLeave}
        >
            <div className="font-bold text-sm text-gray-800 dark:text-white mb-2 px-2">{dropdown.label}</div>
            {dropdown.items.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${pathname === item.href ? 'bg-gray-300 dark:bg-gray-900 font-semibold text-primary-blue dark:text-accent-red' : 'text-gray-800 dark:text-white'}`}
                >
                    <span>{item.label}</span>
                </Link>
            ))}
        </div>,
        document.getElementById('tooltip-root')!
    )}
                            {!isCollapsed && openDropdown === dropdown.label && (
                                <div className="ml-2 mt-1 space-y-1 p-2 rounded-md bg-gray-100 dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                                    {dropdown.items.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`block py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${pathname === item.href ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : 'text-gray-800 dark:text-white'}`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </nav>
            <div className="mt-auto">
                <div className={`mt-4 flex items-center justify-center ${isCollapsed ? 'flex-col space-y-4' : 'space-x-4'}`}>
                    <a href="#" className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                        <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                        <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                        <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white">
                        <TikTokIcon className="h-5 w-5" />
                    </a>
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-300 dark:border-gray-700">
                    <button
                    onClick={() => { if (typeof setIsCollapsed === 'function') setIsCollapsed(!isCollapsed); }}
                    className="flex items-center justify-center w-full py-2 px-4 rounded-md text-gray-600 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}