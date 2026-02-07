'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    messages: boolean;
    bookings: boolean;
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      messages: true,
      bookings: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true,
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ settings: 'Failed to save settings' });
      }
    } catch (error) {
      setErrors({ settings: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSuccess('');
    setErrors({});

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setErrors({ password: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setErrors({ password: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data, including your profile, portfolio, and messages. Continue?')) {
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
        alert('Failed to delete account. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="flex items-center justify-between">
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
              {user?.emailVerified ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  ⚠ Not Verified
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <p className="text-gray-900 dark:text-white">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
        
        {errors.password && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{errors.password}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.currentPassword && <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">New Messages</span>
            <input
              type="checkbox"
              checked={settings.notifications.messages}
              onChange={(e) => handleSettingsChange('notifications', 'messages', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Booking Updates</span>
            <input
              type="checkbox"
              checked={settings.notifications.bookings}
              onChange={(e) => handleSettingsChange('notifications', 'bookings', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Marketing Emails</span>
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingsChange('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            >
              <option value="public">Public - Everyone can see my profile</option>
              <option value="members-only">Members Only - Only logged in users</option>
              <option value="private">Private - Hidden from search</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Show Email on Profile</span>
            <input
              type="checkbox"
              checked={settings.privacy.showEmail}
              onChange={(e) => handleSettingsChange('privacy', 'showEmail', e.target.checked)}
              className="h-5 w-5 text-primary-blue dark:text-accent-red rounded focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Show Location on Profile</span>
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
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. All your data will be permanently deleted.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
