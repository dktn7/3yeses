'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Mail, Users, BookOpen, Shield, ChevronDown } from "lucide-react";
import { FaFacebookF, FaTwitter, FaTiktok, FaMeta } from "react-icons/fa6";
import { ModeToggle } from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/categories', icon: List, label: 'Categories' },
    { href: '/contact', icon: Mail, label: 'Contact Us' }
];

export default function Sidebar() {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const { user, loading } = useAuth();

    // Create dynamic dropdown items based on auth status
    const getDropdownItems = () => [
        {
            icon: Users,
            label: 'Services',
            items: user ? 
                // Authenticated users see dashboard links
                [
                    { href: '/dashboard/talent', label: 'Talent Dashboard' },
                ] :
                // Non-authenticated users see signup links
                [
                    { href: '/auth/login', label: 'Log In' },
                    { href: '/auth/signup', label: 'Join as Talent' },
                ]
        },
        {
            icon: BookOpen,
            label: 'Resources',
            items: [
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/success-stories', label: 'Success Stories' },
                { href: '/pricing', label: 'Pricing Plans' },
            ]
        },
        {
            icon: Shield,
            label: 'Legal',
            items: [
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
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

    const toggleDropdown = (label: string) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };



    return (
        <aside className="w-60 bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white hidden md:flex flex-col justify-between py-6 px-4 transition-colors duration-300 fixed top-0 left-0 h-screen z-40">
            <nav className="space-y-6">
                <Link href="/" className="block">
                    <h1 className="text-2xl font-bold text-center text-blue-400 dark:text-red-400">3YESES</h1>
                </Link>

                {/* Profile and Notifications - Only show when logged in */}
                {user && !loading && (
                    <div className="flex items-center justify-center space-x-3 py-3 border-b border-gray-300 dark:border-gray-700">
                        <NotificationDropdown />
                        <ProfileDropdown 
                            user={{
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: (user.role === 'talent' ? 'TALENT' : 'ADMIN'),
                                avatarUrl: user.avatarUrl
                            }}
                            onLogout={() => { /* sidebar doesn't manage user state directly */ }}
                        />
                    </div>
                )}

                <ul className="space-y-4 text-lg">
                    {navItems.map(({ href, icon: Icon, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                                    pathname === href
                                        ? 'bg-blue-600/20 text-blue-600 dark:bg-red-500/20 dark:text-red-400 font-semibold'
                                        : 'hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                                }`}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </Link>
                        </li>
                    ))}
                    
                    {/* Show auth-related items only when NOT logged in */}
                    {!user && !loading && (
                        <>
                            <li>
                                <Link
                                    href="/auth/signin"
                                    className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                                >
                                    <Users size={20} />
                                    <span>Sign In</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/auth/signup"
                                    className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    <Users size={20} />
                                    <span>Join Now</span>
                                </Link>
                            </li>
                        </>
                    )}
                    
                    {/* Dropdown Menu Items */}
                    {getDropdownItems().map(({ icon: Icon, label, items }) => (
                        <li 
                            key={label}
                            className="relative"
                        >
                            <button
                                onClick={() => toggleDropdown(label)}
                                className={`flex items-center justify-between w-full gap-3 rounded-md px-3 py-2 transition-colors ${
                                    items.some(item => pathname === item.href)
                                        ? 'bg-blue-600/20 text-blue-600 dark:bg-red-500/20 dark:text-red-400 font-semibold'
                                        : 'hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </div>
                                <ChevronDown 
                                    size={16} 
                                    className={`transition-transform duration-200 ${
                                        openDropdown === label ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {/* Dropdown Content */}
                            {openDropdown === label && (
                                <ul className="mt-2 ml-6 space-y-2">
                                    {items.map(({ href, label: itemLabel }) => (
                                        <li key={itemLabel}>
                                            <Link
                                                href={href}
                                                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                                                    pathname === href
                                                        ? 'bg-blue-600/20 text-blue-600 dark:bg-red-500/20 dark:text-red-400 font-semibold'
                                                        : 'hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                                                }`}
                                            >
                                                {itemLabel}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="flex flex-col items-center space-y-4">
                <ModeToggle />
                <div className="flex flex-col items-center space-y-4 text-xl text-gray-500 dark:text-gray-400 pt-4">
                    <button 
                        type="button"
                        className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors transform hover:scale-110"
                        aria-label="Follow us on Facebook"
                    >
                        <FaFacebookF />
                    </button>
                    <button 
                        type="button"
                        className="hover:text-sky-500 dark:hover:text-sky-400 cursor-pointer transition-colors transform hover:scale-110"
                        aria-label="Follow us on Twitter"
                    >
                        <FaTwitter />
                    </button>
                    <button 
                        type="button"
                        className="hover:text-pink-500 dark:hover:text-pink-400 cursor-pointer transition-colors transform hover:scale-110"
                        aria-label="Follow us on TikTok"
                    >
                        <FaTiktok />
                    </button>
                    <button 
                        type="button"
                        className="hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition-colors transform hover:scale-110"
                        aria-label="Follow us on Meta"
                    >
                        <FaMeta />
                    </button>
                </div>
            </div>
        </aside>
    );
}