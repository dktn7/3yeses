'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

interface UserData {
  userId: string;
  email: string;
  role: string;
  name: string;
  profileComplete: boolean;
}

export default function Footer() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
  return (
    <footer className="bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">3YESES</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connecting talent with opportunity in the entertainment industry.
            </p>
            <div className="flex space-x-4">
              <button 
                type="button"
                className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:dark:text-red-400 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </button>
              <button 
                type="button"
                className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:dark:text-red-400 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </button>
              <button 
                type="button"
                className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:dark:text-red-400 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </button>
              <button 
                type="button"
                className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:dark:text-red-400 transition-colors"
                aria-label="Connect with us on LinkedIn"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* For Talent */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Talent</h4>
            <ul className="space-y-2">
              {!user && !loading && (
                <li>
                  <Link href="/auth/signup" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                    Join as Talent
                  </Link>
                </li>
              )}
              {user && !loading && (
                <li>
                  <Link href="/dashboard/talent" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                    Talent Dashboard
                  </Link>
                </li>
              )}
              <li>
                <Link href="/categories" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* For Talent */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Talent</h4>
            <ul className="space-y-2">
              {!user && !loading && (
                <li>
                  <Link href="/auth/signup" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                    Join as Talent
                  </Link>
                </li>
              )}
              {user && !loading && (
                <li>
                  <Link href="/dashboard/talent" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                    Talent Dashboard
                  </Link>
                </li>
              )}
              <li>
                <Link href="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                <span>contact@3yeses.co.uk</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                <span>+44 121 123 4567</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-3" />
                <span>Birmingham, UK</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-300 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-500">
          <p>© 2025 3YESES. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-gray-800 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-800 dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}