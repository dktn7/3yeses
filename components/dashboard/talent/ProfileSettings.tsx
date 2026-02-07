 'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Lock, Users, Globe, Shield, Settings, XCircle, CheckCircle } from 'lucide-react';

interface ProfileSettings {
  id?: string;
  showViewCount: boolean;
  showExperienceLevel: boolean;
  showLocation: boolean;
  showLanguages: boolean;
  showRating: boolean;
  showReviewCount: boolean;
  showWorkHistory: boolean;
  showSocialMedia: boolean;
  showContactInfo: boolean;
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONTACTS_ONLY';
  searchable: boolean;
  allowDirectContact: boolean;
  showOnlineStatus: boolean;
}

const defaultSettings: ProfileSettings = {
  showViewCount: true,
  showExperienceLevel: true,
  showLocation: true,
  showLanguages: true,
  showRating: true,
  showReviewCount: true,
  showWorkHistory: true,
  showSocialMedia: true,
  showContactInfo: true,
  profileVisibility: 'PUBLIC',
  searchable: true,
  allowDirectContact: true,
  showOnlineStatus: false,
};

export default function ProfileSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    const doFetch = async () => {
      try {
        const id = user?.id;
        const url = id ? `/api/talent/${id}/settings` : '/api/profile/settings';
        const response = await fetch(url, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setSettings({ ...defaultSettings, ...data.profileSettings || data });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
  }, [user]);

  // fetchSettings logic inlined into useEffect

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
  const id = user?.id;
  const url = id ? `/api/talent/${id}/settings` : '/api/profile/settings';
  const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess(true);
  setAnnouncement('Settings saved successfully');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
  const msg = err instanceof Error ? err.message : 'Failed to save settings';
  setError(msg);
  setAnnouncement(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof ProfileSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key: keyof ProfileSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
  {/* aria-live region for assistive technologies */}
  <div aria-live="polite" className="sr-only" role="status">{announcement}</div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Privacy Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Control what information is visible on your talent profile
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Profile Visibility */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe size={20} />
              Profile Visibility
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'PUBLIC', icon: Globe, label: 'Public', desc: 'Visible to everyone' },
                { value: 'CONTACTS_ONLY', icon: Users, label: 'Contacts Only', desc: 'Only your contacts can see' },
                { value: 'PRIVATE', icon: Lock, label: 'Private', desc: 'Only you can see' }
              ].map(({ value, icon: Icon, label, desc }) => {
                const selected = settings.profileVisibility === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectChange('profileVisibility', value);
                      }
                    }}
                    onClick={() => handleSelectChange('profileVisibility', value)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye size={20} />
              Information Visibility
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'showViewCount', label: 'View Count', desc: 'Show how many people viewed your profile' },
                { key: 'showExperienceLevel', label: 'Experience Level', desc: 'Show beginner badge and experience info' },
                { key: 'showLocation', label: 'Location', desc: 'Show your city and country' },
                { key: 'showLanguages', label: 'Languages', desc: 'Show languages you speak' },
                { key: 'showRating', label: 'Rating & Comments', desc: 'Show your star rating' },
                { key: 'showReviewCount', label: 'Comment Count', desc: 'Show number of comments received' },
                { key: 'showWorkHistory', label: 'Work History', desc: 'Show your past work and achievements' },
                { key: 'showSocialMedia', label: 'Social Media Links', desc: 'Show your social media profiles' },
                { key: 'showContactInfo', label: 'Contact Information', desc: 'Show contact details for inquiries' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key as keyof ProfileSettings)}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings[key as keyof ProfileSettings] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[key as keyof ProfileSettings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield size={20} />
              Privacy Options
            </h2>
            <div className="space-y-4">
              {[
                { key: 'searchable', label: 'Searchable Profile', desc: 'Allow your profile to appear in search results' },
                { key: 'allowDirectContact', label: 'Direct Contact', desc: 'Allow people to contact you directly' },
                { key: 'showOnlineStatus', label: 'Online Status', desc: 'Show when you\'re online or last active' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key as keyof ProfileSettings)}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings[key as keyof ProfileSettings] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[key as keyof ProfileSettings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {error && (
                <div className="text-red-600 text-sm flex items-center gap-2">
                  <XCircle size={16} />
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Settings saved successfully!
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
