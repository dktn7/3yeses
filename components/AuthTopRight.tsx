"use client";
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ProfileSection from './ProfileSection.tsx';
import LanguageDropdown from './LanguageDropdown';
import { usePathname } from 'next/navigation';

// Static translations for root layout (no NextIntlClientProvider available)
const translations: Record<string, { login: string; signup: string }> = {
  'en': { login: 'Log In', signup: 'Sign Up' },
  'en-gb': { login: 'Log In', signup: 'Sign Up' },
  'fr-FR': { login: 'Connexion', signup: "S'inscrire" },
  'de-DE': { login: 'Anmelden', signup: 'Registrieren' },
  'es-ES': { login: 'Iniciar sesión', signup: 'Regístrate' },
  'it-IT': { login: 'Accedi', signup: 'Iscriviti' },
  'pt-PT': { login: 'Entrar', signup: 'Inscrever-se' },
  'ru-RU': { login: 'Войти', signup: 'Зарегистрироваться' },
  'ja-JP': { login: 'ログイン', signup: '登録' },
  'zh-CN': { login: '登录', signup: '注册' },
  'ar': { login: 'تسجيل الدخول', signup: 'التسجيل' }
};

export default function AuthTopRight() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Extract locale from pathname, validate it's a real locale
  const validLocales = ['en', 'en-gb', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'zh-CN', 'ar'];
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const potentialLocale = pathSegments[0];
  const locale = validLocales.includes(potentialLocale) ? potentialLocale : 'en-gb';
  
  // Get translations for current locale
  const t = translations[locale] || translations['en-gb'];
  
  if (loading) return null;
  if (user) {
    // Adapt user shape: ProfileSection expects user.userId, but our AuthContext provides id
    const adaptedUser = { userId: user.id, email: user.email, role: user.role, name: user.name, profileComplete: user.profileComplete };
    return (
      <div className="flex items-center gap-2">
        <ProfileSection user={adaptedUser} />
      </div>
    );
  }
  return (
    <div className="flex gap-2 items-center">
      <Link
        href={`/${locale}/auth/signin`}
        className="text-sm font-medium px-4 py-2 rounded-md border border-gray-300 bg-white text-black hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors dark:bg-gray-700 dark:text-white dark:border-gray-500 dark:hover:bg-red-500"
      >
        {t.login}
      </Link>
       <Link
         href={`/${locale}/auth/signup/steps/step-1`}
         className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
       >
         {t.signup}
       </Link>
      <LanguageDropdown />
    </div>
  );
}
