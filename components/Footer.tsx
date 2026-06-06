"use client";
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { buildLocalizedPath, getLocaleFromPathname } from '@/lib/locale-path';

export default function Footer() {
  const { user, loading } = useAuth();
  const t = useTranslations('Footer');
  const pathname = usePathname();

  const locale = getLocaleFromPathname(pathname);

  return (
    <footer className="bg-[var(--chrome-bg)] py-12 border-t border-transparent dark:border-[var(--chrome-border)]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About Us */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-50 mb-4 uppercase tracking-wide">{t('aboutUs')}</h4>
            <div className="mb-2">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-slate-50">
                3<span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))' }}>YES</span>ES
              </span>
            </div>
            <p className="text-gray-700 dark:text-slate-200 leading-relaxed max-w-md">
              Showcase your work to a live audience — subscribe to be discoverable and grow through views, likes, comments and shares.
            </p>
          </div>

          {/* For Talent */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-50 mb-4 uppercase tracking-wide">{t('forTalent')}</h4>
            <ul className="space-y-2">
              {!user && !loading && (
                <li>
                  <Link href={buildLocalizedPath(locale, '/auth/signup')} className="text-gray-700 dark:text-slate-200 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors font-medium">
                    {t('joinAsTalent')}
                  </Link>
                </li>
              )}
              {user && !loading && (
                <li>
                  <Link href={buildLocalizedPath(locale, '/dashboard/talent')} className="text-gray-700 dark:text-slate-200 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors font-medium">
                    {t('talentDashboard')}
                  </Link>
                </li>
              )}
              <li>
                <Link href={buildLocalizedPath(locale, '/categories')} className="text-gray-700 dark:text-slate-200 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors">
                  {t('browseCategories')}
                </Link>
              </li>
              <li>
                <Link href={buildLocalizedPath(locale, '/pricing')} className="text-gray-700 dark:text-slate-200 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors">
                  {t('pricingPlans')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-50 mb-4 uppercase tracking-wide">{t('contactUs')}</h4>
            <ul className="space-y-3 text-gray-700 dark:text-slate-200">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-500 dark:text-slate-300" />
                <span className="text-sm">{t('email')}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-gray-500 dark:text-slate-300" />
                <span className="text-sm">{t('phone')}</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-500 dark:text-slate-300" />
                <span className="text-sm">{t('location')}</span>
              </li>
            </ul>
          </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-[var(--chrome-border)] pt-6">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <p className="text-sm text-gray-600 dark:text-slate-300">{t('copyright')}</p>
              <div className="hidden md:flex items-center gap-3 text-gray-600 dark:text-slate-300">
                <a href="#" aria-label="Twitter" className="hover:text-[var(--brand-primary)] dark:hover:text-accent-red"><Twitter className="h-4 w-4" /></a>
                <a href="#" aria-label="Facebook" className="hover:text-[var(--brand-primary)] dark:hover:text-accent-red"><Facebook className="h-4 w-4" /></a>
                <a href="#" aria-label="Instagram" className="hover:text-[var(--brand-primary)] dark:hover:text-accent-red"><Instagram className="h-4 w-4" /></a>
                <a href="#" aria-label="TikTok" className="hover:text-[var(--brand-primary)] dark:hover:text-accent-red"><TikTokIcon className="h-4 w-4" /></a>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link href={buildLocalizedPath(locale, '/privacy')} className="text-gray-600 dark:text-slate-300 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors">{t('privacyPolicy')}</Link>
              <Link href={buildLocalizedPath(locale, '/terms')} className="text-gray-600 dark:text-slate-300 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors">{t('termsOfService')}</Link>
              <button onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))} className="text-gray-600 dark:text-slate-300 hover:text-[var(--brand-primary)] dark:hover:text-accent-red transition-colors">Cookie Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </footer>
  );
}
