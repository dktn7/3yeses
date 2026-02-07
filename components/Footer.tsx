"use client";
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { user, loading } = useAuth();
  const t = useTranslations('Footer');
  const pathname = usePathname();

  // Get current locale from pathname, handling both locale-based and auth routes
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const validLocales = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];
  const firstSegment = pathSegments[0] || 'en-gb';
  // If first segment is not a valid locale (e.g., 'auth'), default to 'en-gb'
  const locale = validLocales.includes(firstSegment) ? firstSegment : 'en-gb';

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Us */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('aboutUs')}</h4>
            <p className="text-gray-700 dark:text-gray-300">
              {t('companyInfo')}
            </p>
          </div>

          {/* For Talent */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('forTalent')}</h4>
            <ul className="space-y-2">
              {!user && !loading && (
                <li>
                  <Link href="/auth/signup" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                    {t('joinAsTalent')}
                  </Link>
                </li>
              )}
              {user && !loading && (
                <li>
                  <Link href="/dashboard/talent" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                    {t('talentDashboard')}
                  </Link>
                </li>
              )}
              <li>
                <Link href={`/${locale}/categories`} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  {t('browseCategories')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                  {t('pricingPlans')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('contactUs')}</h4>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                <span>{t('email')}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                <span>{t('phone')}</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-3" />
                <span>{t('location')}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-300 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-500">
          <p>{t('copyright')}</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
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
            {/* Legal Links */}
            <div className="flex items-center space-x-4">
              <Link href={`/${locale}/privacy`} className="hover:text-gray-800 dark:hover:text-white transition-colors">{t('privacyPolicy')}</Link>
              <Link href={`/${locale}/terms`} className="hover:text-gray-800 dark:hover:text-white transition-colors">{t('termsOfService')}</Link>
              <button 
                onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
                className="hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cookie Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}