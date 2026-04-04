'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface Settings {
  notifications: {
    email: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'members-only';
    showEmail: boolean;
    showLocation: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('dashboard.settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserAndSettings();
  }, []);

  const fetchUserAndSettings = async () => {
    try {
      const [userResponse, settingsResponse] = await Promise.all([
        fetch('/api/auth/verify', { credentials: 'include' }),
        fetch('/api/user/settings', { credentials: 'include' }),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.settings) {
          setSettings(settingsData.settings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (section: 'notifications' | 'privacy', field: string, value: any) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccess('');
    setErrors({});

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(t('savedSuccess'));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ settings: t('saveFailed') });
      }
    } catch (error) {
      setErrors({ settings: t('errorOccurred') });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    if (!confirm(t('confirmDeleteFinal'))) {
      return;
    }

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/');
      } else {
        alert(t('deleteFailed'));
      }
    } catch (error) {
      alert(t('deleteError'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 dark:text-green-400 text-xl mr-3">✓</span>
            <p className="text-green-800 dark:text-green-300 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('accountInfo')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('emailAddress')}
            </label>
            <div className="flex items-center justify-between">
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
              {user?.emailVerified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {t('verified')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {t('notVerified')}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('name')}
            </label>
            <p className="text-gray-900 dark:text-white">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Password Change Notice */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('password')}</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-300">
            {t('passwordChangeNotice')}
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('notificationPrefs')}</h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">{t('emailNotifications')}</span>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">{t('marketingEmails')}</span>
            <input
              type="checkbox"
              checked={settings.notifications.marketing}
              onChange={(e) => handleSettingsChange('notifications', 'marketing', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('privacySettings')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profileVisibility')}
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingsChange('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            >
              <option value="public">{t('visibilityPublic')}</option>
              <option value="members-only">{t('visibilityMembers')}</option>
              <option value="private">{t('visibilityPrivate')}</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">{t('showEmail')}</span>
            <input
              type="checkbox"
              checked={settings.privacy.showEmail}
              onChange={(e) => handleSettingsChange('privacy', 'showEmail', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">{t('showLocation')}</span>
            <input
              type="checkbox"
              checked={settings.privacy.showLocation}
              onChange={(e) => handleSettingsChange('privacy', 'showLocation', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="mt-6 px-6 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? t('saving') : t('saveSettings')}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">{t('dangerZone')}</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('deleteAccount')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('deleteAccountDesc')}
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('deleteMyAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
