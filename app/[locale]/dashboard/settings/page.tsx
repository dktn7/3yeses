'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Eye,
  Images,
  KeyRound,
  Mail,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import {
  DashboardButton,
  DashboardField,
  DashboardHeader,
  DashboardLoading,
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
import { ModeToggle } from '@/components/ThemeToggle';
import LanguageDropdown from '@/components/LanguageDropdown';

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
    showLocation: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.settings');
  const chrome = useTranslations('dashboard.chrome');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings>({
    notifications: { email: true, marketing: false },
    privacy: { profileVisibility: 'public', showLocation: true },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
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
      setErrors({ password: chrome('enterCurrentPassword') });
      return;
    }
    if (passwordScore < 5) {
      setErrors({ password: chrome('passwordRequirements') });
      return;
    }
    if (!/^\d{6}$/.test(verificationCode)) {
      setErrors({ password: chrome('requestCode') });
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
          verificationCode,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setVerificationCode('');
        setCodeSent(false);
        flashSuccess(chrome('passwordUpdated'));
      } else {
        setErrors({ password: data.error || chrome('errorChangePassword') });
      }
    } catch (error) {
      setErrors({ password: chrome('errorChangePassword') });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSendPasswordCode = async () => {
    if (!passwordForm.currentPassword) {
      setErrors({ password: chrome('enterCurrentPassword') });
      return;
    }
    if (passwordScore < 5) {
      setErrors({ password: chrome('passwordRequirements') });
      return;
    }
    setCodeSending(true);
    setErrors({});
    try {
      const response = await fetch(`/api/user/password-change-code?locale=${encodeURIComponent(locale)}`, { method: 'POST', credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setCodeSent(true);
        flashSuccess(chrome('codeSent'));
      } else setErrors({ password: data.error || chrome('errorSendCode') });
    } catch (error) {
      setErrors({ password: chrome('errorSendCode') });
    } finally {
      setCodeSending(false);
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
        flashSuccess(chrome('resetLinkSent'));
      } else {
        const data = await response.json().catch(() => ({}));
        setErrors({ reset: data.error || chrome('errorResetLink') });
      }
    } catch (error) {
      setErrors({ reset: chrome('errorResetLink') });
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

  if (loading) return <DashboardLoading />;

  return (
    <DashboardWorkspace className="dashboard-settings-page">
      <DashboardHeader
        icon={SettingsIcon}
        title={chrome('accountSettingsTitle')}
        description={chrome('accountSettingsDescription')}
        actions={
          <DashboardButton onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4" aria-hidden="true" />
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
          <DashboardPanel className="settings-account-panel">
            <PanelHeading title={t('accountInfo')} description={chrome('accountIdentityDescription')} />
            <div className="settings-account-identity">
              <div className="settings-account-avatar">
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
            <div className="settings-account-note"><ShieldCheck className="h-4 w-4" aria-hidden="true" /><span>{chrome('privateEmailNote')}</span></div>
            <div className="settings-account-stats mt-5">
              <DashboardStatRow
                items={[
                  { label: 'Email', icon: Mail, value: user?.emailVerified ? 'Verified' : 'Review', detail: 'Private sign-in identity' },
                  { label: 'Privacy', icon: Eye, value: settings.privacy.profileVisibility, detail: 'Profile visibility' },
                  { label: 'Notices', icon: Bell, value: settings.notifications.email ? 'On' : 'Off', detail: 'Email notifications' },
                  { label: 'Security', icon: ShieldCheck, value: passwordScore ? `${passwordScore}/5` : 'Ready', detail: 'Password strength' },
                ]}
              />
            </div>
          </DashboardPanel>

          <DashboardPanel className="settings-quick-panel">
            <PanelHeading title={chrome('quickAccess')} description={chrome('quickAccessDescription')} />
            <div className="settings-quick-links">
              <DashboardButton className="settings-quick-icon" variant="secondary" href={buildLocalizedPath(locale, '/dashboard/profile')} aria-label="Profile"><UserRound className="h-5 w-5" aria-hidden="true" /></DashboardButton>
              <DashboardButton className="settings-quick-icon" variant="secondary" href={buildLocalizedPath(locale, '/dashboard/gallery')} aria-label="Gallery"><Images className="h-5 w-5" aria-hidden="true" /></DashboardButton>
              <DashboardButton className="settings-quick-icon" variant="secondary" href={buildLocalizedPath(locale, '/dashboard/subscription')} aria-label="Subscription"><Sparkles className="h-5 w-5" aria-hidden="true" /></DashboardButton>
            </div>
          </DashboardPanel>
        </aside>

        <div className="dashboard-settings-panel space-y-6">
          <DashboardPanel className="settings-security-panel">
            <PanelHeading title={chrome('changePasswordTitle')} description={chrome('changePasswordDescription')} />
            <form onSubmit={handlePasswordChange} className="grid gap-5 xl:grid-cols-3">
              <DashboardField id="current-password" label="Current password">
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className={inputClass(Boolean(errors.password))}
                />
              </DashboardField>
              <DashboardField id="new-password" label="New password">
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className={inputClass(Boolean(errors.password))}
                />
              </DashboardField>
              <DashboardField id="confirm-password" label="Confirm password">
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className={inputClass(Boolean(errors.password))}
                />
              </DashboardField>
              {codeSent && <div className="xl:col-span-3 settings-security-code">
                <div className="flex flex-col gap-4 rounded-2xl border border-[var(--chrome-border)] bg-[var(--chrome-bg)] p-4 sm:flex-row sm:items-end sm:justify-between">
                  <DashboardField id="password-verification-code" label="Email verification code" hint={`Code sent to ${user?.email || 'your verified email'}. It expires in 10 minutes.`}>
                    <input
                      id="password-verification-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={inputClass(Boolean(errors.password))}
                      placeholder="000000"
                    />
                  </DashboardField>
                  <DashboardButton type="button" variant="secondary" onClick={handleSendPasswordCode} disabled={codeSending || !user?.emailVerified}>
                    <Mail className="h-4 w-4" />
                    {codeSending ? 'Sending code' : 'Resend code'}
                  </DashboardButton>
                </div>
              </div>}

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
              </div>

              <div className="flex flex-wrap gap-3 xl:col-span-3">
                {!codeSent ? (
                  <DashboardButton type="button" onClick={handleSendPasswordCode} disabled={codeSending || !user?.emailVerified}>
                    <Mail className="h-4 w-4" />
                    {codeSending ? 'Sending verification code' : 'Send verification code'}
                  </DashboardButton>
                ) : (
                  <DashboardButton type="submit" disabled={passwordSaving}>
                    <KeyRound className="h-4 w-4" />
                    {passwordSaving ? 'Changing password' : 'Change password'}
                  </DashboardButton>
                )}
              </div>
            </form>
          </DashboardPanel>

          <DashboardPanel className="settings-recovery-panel">
            <PanelHeading title="Forgot your current password?" description="You do not need your current password. We’ll send a secure reset link to your verified account email." />
            <DashboardButton type="button" variant="secondary" onClick={handleResetEmail} disabled={resetSending || !user?.email}>
              <Mail className="h-4 w-4" />
              {resetSending ? 'Sending reset link' : 'Send password reset link'}
            </DashboardButton>
            {errors.reset && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-300">{errors.reset}</p>}
          </DashboardPanel>

          <DashboardPanel className="settings-notifications-panel">
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

          <DashboardPanel className="settings-preferences-panel">
            <PanelHeading title="Workspace preferences" description="Choose how the studio feels and how you move through it." />
            <div className="settings-preference-row">
              <div><p className="text-sm font-semibold text-slate-950 dark:text-white">Appearance</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Switch between the light and dark studio palettes.</p></div>
              <ModeToggle />
            </div>
            <div className="settings-preference-row">
              <div><p className="text-sm font-semibold text-slate-950 dark:text-white">Language</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Choose the language used across your account.</p></div>
              <LanguageDropdown />
            </div>
          </DashboardPanel>

          <DashboardPanel className="settings-visibility-panel">
            <PanelHeading title={t('privacySettings')} description="Control who can discover your showcase. These choices affect profile visibility only; your sign-in email and account access always stay private." />
            <div className="space-y-5">
              <DashboardField label={t('profileVisibility')} hint="Choose who can discover and open your public profile.">
                <div className="settings-privacy-visibility">
                <SegmentedControl
                  value={settings.privacy.profileVisibility}
                  onChange={(value) => handleSettingsChange('privacy', 'profileVisibility', value)}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'members-only', label: 'Members only' },
                    { value: 'private', label: 'Private' },
                  ]}
                />
                </div>
              </DashboardField>
              <DashboardToggle checked={settings.privacy.showLocation} onChange={(checked) => handleSettingsChange('privacy', 'showLocation', checked)} label={t('showLocation')} description="Show your location to help people discover your creative presence." />
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
                <Trash2 className="h-6 w-6" aria-hidden="true" />
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

