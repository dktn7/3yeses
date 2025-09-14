'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { ModeToggle } from './ThemeToggle';
import ProfileSection from './ProfileSection';

interface UserData {
  userId: string;
  email: string;
  role: string;
  name: string;
  profileComplete: boolean;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Individual dropdown components handle their own outside clicks

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Browse Talent' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/success-stories', label: 'Success Stories' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700' 
        : 'bg-white dark:bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-red-500 dark:to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg transform group-hover:rotate-6 transition-transform">
              3Y
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-red-500 transition-colors">
              3YESES
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-red-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Right side - Social Media + Theme Toggle + User */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <button 
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-4 h-4" />
              </button>
              <button 
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </button>
              <button 
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </button>
              <button 
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Connect with us on LinkedIn"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User Section */}
            {!loading && (
              <>
                {user ? (
                  <ProfileSection 
                    className="flex items-center" 
                    user={user}
                    onLogout={handleLogout}
                  />
                ) : (
                  <ProfileSection 
                    className="flex items-center" 
                    showSignInModal={true}
                  />
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile User Section */}
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  {user.role === 'talent' ? (
                    <Link
                      href="/dashboard/talent"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Talent Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/client"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Client Dashboard
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Main Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile Settings
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-2">
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-red-500 dark:to-pink-500 text-white block px-3 py-2 rounded-md text-base font-medium text-center transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </>
          )}
          
          {/* Mobile Social Media */}
          <div className="flex items-center justify-center space-x-4 py-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <button 
              type="button"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Follow us on Facebook"
            >
              <FaFacebookF className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Follow us on Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Follow us on Instagram"
            >
              <FaInstagram className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Connect with us on LinkedIn"
            >
              <FaLinkedinIn className="w-5 h-5" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
