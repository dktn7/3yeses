'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Chrome, Facebook, Apple } from 'lucide-react';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onClick: () => void;
}

function SocialLoginButton({ provider, onClick }: SocialLoginButtonProps) {
  const config = {
    google: {
      icon: Chrome,
      text: 'Continue with Google',
      bgColor: 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600',
      textColor: 'text-gray-900 dark:text-white',
      borderColor: 'border-gray-300 dark:border-gray-600',
    },
    facebook: {
      icon: Facebook,
      text: 'Continue with Facebook',
      bgColor: 'bg-[#1877F2] hover:bg-[#166FE5]',
      textColor: 'text-white',
      borderColor: 'border-[#1877F2]',
    },
    apple: {
      icon: Apple,
      text: 'Continue with Apple',
      bgColor: 'bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-100',
      textColor: 'text-white dark:text-black',
      borderColor: 'border-black dark:border-white',
    },
  };

  const { icon: Icon, text, bgColor, textColor, borderColor } = config[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} font-medium transition-all shadow-sm hover:shadow`}
    >
      <Icon className="h-5 w-5" />
      {text}
    </button>
  );
}

export default function AuthOptionsComponent() {
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login
    alert(`Social login with ${provider} is not yet implemented. Coming soon!`);
  };

  return (
    <div className="space-y-4">
      {/* Social Login Options */}
      {!showEmailForm && (
        <>
          <div className="space-y-3">
            <SocialLoginButton
              provider="google"
              onClick={() => handleSocialLogin('Google')}
            />
            <SocialLoginButton
              provider="facebook"
              onClick={() => handleSocialLogin('Facebook')}
            />
            <SocialLoginButton
              provider="apple"
              onClick={() => handleSocialLogin('Apple')}
            />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Button */}
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-primary-blue dark:border-accent-red text-primary-blue dark:text-accent-red hover:bg-blue-50 dark:hover:bg-red-900/20 font-medium transition-all"
          >
            <Mail className="h-5 w-5" />
            Continue with Email
          </button>
        </>
      )}

      {/* Back Button (when email form is shown) */}
      {showEmailForm && (
        <button
          type="button"
          onClick={() => setShowEmailForm(false)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          ← Back to login options
        </button>
      )}
    </div>
  );
}
