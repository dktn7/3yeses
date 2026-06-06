'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Mail, BookOpen, Shield, ChevronDown, ChevronsLeft, ChevronsRight, Grid, CreditCard, Compass } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import TikTokIcon from './icons/TikTokIcon';
import Tooltip from './Tooltip';
import { useTranslations } from 'next-intl';
import { buildLocalizedPath, getLocaleFromPathname } from '@/lib/locale-path';

export default function Sidebar({ isCollapsed = false, setIsCollapsed }: { isCollapsed?: boolean, setIsCollapsed?: (isCollapsed: boolean) => void }) {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
    const popoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const t = useTranslations('Navigation');

    // Get current locale from pathname, handling both locale-based and auth routes
    const locale = getLocaleFromPathname(pathname);

    const isNavItemActive = (href: string) => {
        if (href === buildLocalizedPath(locale, '/')) {
            return pathname === href || pathname === `${href}/`;
        }

        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    // Create nav items using translations with locale-aware links
    const navItems = [
        { href: buildLocalizedPath(locale, '/'), icon: Home, label: t('home') },
        { href: buildLocalizedPath(locale, '/about'), icon: BookOpen, label: t('about') },
        { href: buildLocalizedPath(locale, '/why-how'), icon: Compass, label: t('whyAndHow') },
        { href: buildLocalizedPath(locale, '/categories'), icon: List, label: t('categories') },
        { href: buildLocalizedPath(locale, '/pricing'), icon: CreditCard, label: t('pricing') },
        { href: buildLocalizedPath(locale, '/hub'), icon: Grid, label: t('talentHub') },
        { href: buildLocalizedPath(locale, '/support'), icon: Mail, label: t('support') }
    ];

    // Create dynamic dropdown items based on auth status with locale-aware links
    const getDropdownItems = () => [
        {
            icon: Shield,
            label: t('legal'),
            items: [
                { href: buildLocalizedPath(locale, '/privacy'), label: t('privacyPolicy') },
                { href: buildLocalizedPath(locale, '/terms'), label: t('termsOfService') },
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
        <aside className={`fixed top-16 left-0 z-50 flex h-[calc(100vh-4rem)] flex-col overflow-y-auto border-r border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-3 py-6 text-[var(--sidebar-text)] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isCollapsed ? 'w-20' : 'w-60'}`}>
            <div className="flex items-center justify-end mb-4">
           </div>
            <nav className="space-y-5 flex-1">
                <div className="space-y-1">
                    {navItems.map((item, index) => {
        const isActive = isNavItemActive(item.href);
                        return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isActive
                                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold shadow-sm ring-1 ring-blue-200/80 ring-offset-1 ring-offset-[var(--chrome-bg)] dark:bg-[rgba(185,28,28,0.22)] dark:text-red-100 dark:ring-1 dark:ring-red-500/60 dark:ring-offset-2 dark:ring-offset-[rgba(17,24,39,0.95)]'
                                : 'text-[var(--sidebar-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--sidebar-text-hover)]'
                            }`}
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            {isCollapsed ? (
                                <Tooltip text={item.label}>
                                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${isActive ? 'text-[var(--brand-primary)]' : ''}`} />
                                </Tooltip>
                            ) : (
                                <>
                                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${isActive ? 'text-[var(--brand-primary)]' : ''}`} />
                                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                </>
                            )}
                        </Link>
                        );
                    })}
                </div>

                <div className="h-px bg-[var(--chrome-border)] mx-2" />

                <div className="space-y-1">
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
                                className={`group flex items-center justify-between w-full py-2.5 px-4 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${openDropdown === dropdown.label
                                    ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold ring-1 ring-blue-200/80 ring-offset-1 ring-offset-[var(--chrome-bg)] dark:bg-[rgba(185,28,28,0.22)] dark:text-red-100 dark:ring-1 dark:ring-red-500/60 dark:ring-offset-2 dark:ring-offset-[rgba(17,24,39,0.95)]'
                                    : 'text-[var(--sidebar-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--sidebar-text-hover)]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <dropdown.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110" />
                                    {!isCollapsed && <span className="text-sm font-medium tracking-tight">{dropdown.label}</span>}
                                </div>
                                {!isCollapsed && <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${openDropdown === dropdown.label ? 'rotate-180' : ''}`} />}
                            </button>
                            {isCollapsed && popoverOpen === dropdown.label &&
    ReactDOM.createPortal(
        <div
            className="absolute z-50 w-52 rounded-xl bg-[var(--chrome-panel)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-[var(--chrome-border)] backdrop-blur-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
            onMouseEnter={() => handleMouseEnter(dropdown.label)}
            onMouseLeave={handleMouseLeave}
        >
            <div className="mb-2 px-3 pt-1 text-xs font-semibold uppercase tracking-wider text-[var(--sidebar-muted)]">{dropdown.label}</div>
            {dropdown.items.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-200 ${isNavItemActive(item.href)
                        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold ring-1 ring-blue-200/80 ring-offset-1 ring-offset-[var(--chrome-bg)] dark:bg-[rgba(185,28,28,0.22)] dark:text-red-100 dark:ring-1 dark:ring-red-500/60 dark:ring-offset-2 dark:ring-offset-[rgba(17,24,39,0.95)]'
                        : 'text-[var(--sidebar-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--sidebar-text-hover)]'
                    }`}
                >
                    <span>{item.label}</span>
                </Link>
            ))}
        </div>,
        document.getElementById('tooltip-root')!
    )}
                            {!isCollapsed && openDropdown === dropdown.label && (
                                <div className="ml-3 mt-1 space-y-0.5 rounded-lg bg-black/[0.02] px-1 py-1.5 ring-1 ring-black/[0.04] dark:bg-white/[0.03] dark:ring-white/[0.06]">
                                    {dropdown.items.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`block py-2 px-3 rounded-lg text-sm transition-all duration-200 ${isNavItemActive(item.href)
                                                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold ring-1 ring-blue-200/80 ring-offset-1 ring-offset-[var(--chrome-bg)] dark:bg-[rgba(185,28,28,0.18)] dark:text-red-100 dark:ring-red-500/20 dark:ring-offset-transparent'
                                                : 'text-[var(--sidebar-text)] hover:bg-[var(--chrome-hover)] hover:text-[var(--sidebar-text-hover)]'
                                            }`}
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

            <div className="mt-auto pt-3">
                <div className="h-px bg-[var(--chrome-border)] mx-2 mb-4" />
                <div className={`flex items-center justify-center ${isCollapsed ? 'flex-col space-y-3' : 'space-x-3'}`}>
                    <a href="#" className="text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text-hover)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110" aria-label="Twitter">
                        <Twitter className="h-4.5 w-4.5" />
                    </a>
                    <a href="#" className="text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text-hover)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110" aria-label="Facebook">
                        <Facebook className="h-4.5 w-4.5" />
                    </a>
                    <a href="#" className="text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text-hover)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110" aria-label="Instagram">
                        <Instagram className="h-4.5 w-4.5" />
                    </a>
                    <a href="#" className="text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text-hover)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110" aria-label="TikTok">
                        <TikTokIcon className="h-4.5 w-4.5" />
                    </a>
                </div>
            </div>
            <div className="pt-4">
                    <button
                    onClick={() => { if (typeof setIsCollapsed === 'function') setIsCollapsed(!isCollapsed); }}
                    className="group flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-[var(--sidebar-muted)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--chrome-hover)] hover:text-[var(--sidebar-muted-strong)]"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronsRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" /> : <ChevronsLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-0.5" />}
                </button>
            </div>
        </aside>
    );
}
