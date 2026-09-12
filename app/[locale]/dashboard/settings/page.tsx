'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Eye,
  Fingerprint,
  KeyRound,
  Mail,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  DashboardActionCard,
  DashboardButton,
  DashboardField,
  DashboardHeader,
  DashboardPanel,
  DashboardStatRow,
  DashboardToggle,
  DashboardWorkspace,
  PanelHeading,
  SegmentedControl,
  StatusPill,
  inputClass,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';

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
  const locale = useLocale();
  const t = useTranslations('dashboard.settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    notifications: { email: true, marketing: false },
    privacy: { profileVisibility: 'public', showEmail: false, showLocation: true },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);

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
        if (settingsData.settings) setSettings(settingsData.settings);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = useMemo(() => {
    const value = passwordForm.newPassword;
    return {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      matches: value.length > 0 && value === passwordForm.confirmPassword,
    };
  }, [passwordForm]);

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const handleSettingsChange = (section: 'notifications' | 'privacy', field: string, value: any) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const flashSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3500);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        flashSuccess(t('savedSuccess'));
      } else {
        setErrors({ settings: t('saveFailed') });
      }
    } catch (error) {
      setErrors({ settings: t('errorOccurred') });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setSuccess('');

    if (!passwordForm.currentPassword) {
      setErrors({ password: 'Enter your current password.' });
      return;
    }
    if (passwordScore < 5) {
      setErrors({ password: 'New password must meet every requirement and match confirmation.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        flashSuccess('Password updated securely.');
      } else {
        setErrors({ password: data.error || 'We could not change your password.' });
      }
    } catch (error) {
      setErrors({ password: 'We could not change your password. Please try again.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResetEmail = async () => {
    if (!user?.email) return;
    setResetSending(true);
    setErrors({});
    setSuccess('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, locale }),
      });
      if (response.ok) {
        flashSuccess('Password reset link sent to your account email.');
      } else {
        const data = await response.json().catch(() => ({}));
        setErrors({ reset: data.error || 'We could not send the reset link.' });
      }
    } catch (error) {
      setErrors({ reset: 'We could not send the reset link. Please try again.' });
    } finally {
      setResetSending(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAcknowledged) {
      setErrors({ delete: t('confirmDeleteFinal') });
      return;
    }

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push(buildLocalizedPath(locale, '/'));
      } else {
        setErrors({ delete: t('deleteFailed') });
      }
    } catch (error) {
      setErrors({ delete: t('deleteError') });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DashboardWorkspace>
      <DashboardHeader
        icon={SettingsIcon}
        title="Account settings"
        description="Choose your privacy preferences, manage notifications, and keep your account secure."
        actions={
          <DashboardButton onClick={handleSaveSettings} disabled={saving}>
            <ShieldCheck className="h-4 w-4" />
            {saving ? t('saving') : t('saveSettings')}
          </DashboardButton>
        }
      />

      {success && (
        <DashboardPanel compact className="bg-emerald-500/10 ring-emerald-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{success}</p>
          </div>
        </DashboardPanel>
      )}

      <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <DashboardPanel>
            <PanelHeading title={t('accountInfo')} description="The account identity used across billing, profile ownership, and support tickets." />
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[color:var(--brand-primary)] text-xl font-semibold text-white">
                {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-950 dark:text-white">{user?.name}</p>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
                <div className="mt-2">
                  {user?.emailVerified ? <StatusPill tone="success">{t('verified')}</StatusPill> : <StatusPill tone="warning">{t('notVerified')}</StatusPill>}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <DashboardStatRow
                items={[
                  { label: 'Email', value: user?.emailVerified ? 'Verified' : 'Review', detail: 'Sign-in identity' },
                  { label: 'Privacy', value: settings.privacy.profileVisibility, detail: 'Profile visibility' },
                  { label: 'Notices', value: settings.notifications.email ? 'On' : 'Off', detail: 'Email notifications' },
                  { label: 'Security', value: passwordScore ? `${passwordScore}/5` : 'Ready', detail: 'Password strength' },
                ]}
              />
            </div>
          </DashboardPanel>

          <DashboardActionCard
            icon={Fingerprint}
            title="Security reminder"
            description="Use a unique password for 3YESES. Reset links are sent only to your verified account email."
            tone="accent"
          />
        </aside>

        <div className="space-y-6">
          <DashboardPanel>
            <PanelHeading title="Password and recovery" description="Change your password directly or send yourself the secure reset flow." />
            <form onSubmit={handlePasswordChange} className="grid gap-5 xl:grid-cols-3">
              <DashboardField label="Current password">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className={inputClass(Boolean(errors.password))}
                />
              </DashboardField>
              <DashboardField label="New password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className={inputClass(Boolean(errors.password))}
                />
              </DashboardField>
              <DashboardField label="Confirm password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className={inputClass(Boolean(errors.password))}
                />
              </DashboardField>

              <div className="xl:col-span-3">
                <div className="grid gap-2 sm:grid-cols-5">
                  {[
                    ['8 characters', passwordChecks.length],
                    ['Uppercase', passwordChecks.upper],
                    ['Lowercase', passwordChecks.lower],
                    ['Number', passwordChecks.number],
                    ['Matches', passwordChecks.matches],
                  ].map(([label, done]) => (
                    <div key={label as string} className={`rounded-2xl px-3 py-2 text-xs font-semibold ${done ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400'}`}>
                      {label as string}
                    </div>
                  ))}
                </div>
                {errors.password && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-300">{errors.password}</p>}
                {errors.reset && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-300">{errors.reset}</p>}
              </div>

              <div className="flex flex-wrap gap-3 xl:col-span-3">
                <DashboardButton type="submit" disabled={passwordSaving}>
                  <KeyRound className="h-4 w-4" />
                  {passwordSaving ? 'Changing password' : 'Change password'}
                </DashboardButton>
                <DashboardButton type="button" variant="secondary" onClick={handleResetEmail} disabled={resetSending || !user?.email}>
                  <Mail className="h-4 w-4" />
                  {resetSending ? 'Sending reset link' : 'Email reset link'}
                </DashboardButton>
              </div>
            </form>
          </DashboardPanel>

          <DashboardPanel>
            <PanelHeading title={t('notificationPrefs')} description="Choose which updates should reach your inbox." />
            <div className="space-y-3">
              <DashboardToggle
                checked={settings.notifications.email}
                onChange={(checked) => handleSettingsChange('notifications', 'email', checked)}
                label={t('emailNotifications')}
                description="Profile, account, billing, and support notices."
              />
              <DashboardToggle
                checked={settings.notifications.marketing}
                onChange={(checked) => handleSettingsChange('notifications', 'marketing', checked)}
                label={t('marketingEmails')}
                description="Product updates and talent growth tips."
              />
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <PanelHeading title={t('privacySettings')} description="Control how discoverable your showcase is to visitors and members." />
            <div className="space-y-5">
              <DashboardField label={t('profileVisibility')}>
                <SegmentedControl
                  value={settings.privacy.profileVisibility}
                  onChange={(value) => handleSettingsChange('privacy', 'profileVisibility', value)}
                  options={[
                    { value: 'public', label: t('visibilityPublic') },
                    { value: 'members-only', label: t('visibilityMembers') },
                    { value: 'private', label: t('visibilityPrivate') },
                  ]}
                />
              </DashboardField>
              <DashboardToggle checked={settings.privacy.showEmail} onChange={(checked) => handleSettingsChange('privacy', 'showEmail', checked)} label={t('showEmail')} description="Show your email on your visible profile." />
              <DashboardToggle checked={settings.privacy.showLocation} onChange={(checked) => handleSettingsChange('privacy', 'showLocation', checked)} label={t('showLocation')} description="Show your location to support relevant casting discovery." />
              {errors.settings && <p className="text-sm font-semibold text-red-600 dark:text-red-300">{errors.settings}</p>}
            </div>
          </DashboardPanel>

          <DashboardPanel className="bg-red-500/8 ring-red-500/15">
            <PanelHeading title={<span className="text-red-700 dark:text-red-300">{t('dangerZone')}</span>} description={t('deleteAccountDesc')} />
            <DashboardButton variant="danger" onClick={() => { setDeleteConfirmOpen(true); setErrors({}); }}>
              <Trash2 className="h-4 w-4" />
              {t('deleteMyAccount')}
            </DashboardButton>
          </DashboardPanel>
        </div>
      </div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <DashboardPanel className="w-full max-w-lg bg-red-500/8 ring-red-500/20">
            <div className="mb-5 flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950/45 dark:text-red-300">
                <Eye className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{t('deleteAccount')}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{t('confirmDelete')}</p>
              </div>
            </div>
            <DashboardToggle
              checked={deleteAcknowledged}
              onChange={(checked) => {
                setDeleteAcknowledged(checked);
                setErrors({});
              }}
              label={t('confirmDeleteFinal')}
            />
            {errors.delete && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-300">{errors.delete}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <DashboardButton variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
                {t('cancel')}
              </DashboardButton>
              <DashboardButton variant="danger" onClick={handleDeleteAccount}>
                {t('deleteMyAccount')}
              </DashboardButton>
            </div>
          </DashboardPanel>
        </div>
      )}
    </DashboardWorkspace>
  );
}

