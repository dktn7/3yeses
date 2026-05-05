'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Mail,
  CreditCard,
  Users,
  Save,
  Loader2,
  CheckCircle,
  Accessibility,
  Type,
  Eye,
  Contrast,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminTheme } from '@/components/admin/AdminThemeProvider';

interface SettingsData {
  general: {
    platformName: string;
    supportEmail: string;
    defaultLanguage: string;
    timezone: string;
  };
  security: {
    requireEmailVerification: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    encryption: string;
    fromEmail: string;
  };
  payments: {
    gateway: string;
    commission: number;
    currency: string;
  };
  users: {
    maxPortfolioItems: number;
    requireApproval: boolean;
    allowSelfDelete: boolean;
  };
  notifications: {
    emailOnNewUser: boolean;
    emailOnReport: boolean;
    emailOnPayment: boolean;
  };
  accessibility: {
    fontSize: number;
    highContrast: boolean;
    invertColors: boolean;
  };
}

const DEFAULT_SETTINGS: SettingsData = {
  general: { platformName: '3YESES', supportEmail: 'support@3yeses.online', defaultLanguage: 'en', timezone: 'UTC' },
  security: { requireEmailVerification: true, twoFactorAuth: false, sessionTimeout: 60 },
  email: { smtpHost: '', smtpPort: 587, encryption: 'tls', fromEmail: 'noreply@3yeses.online' },
  payments: { gateway: 'stripe', commission: 15, currency: 'GBP' },
  users: { maxPortfolioItems: 50, requireApproval: false, allowSelfDelete: true },
  notifications: { emailOnNewUser: true, emailOnReport: true, emailOnPayment: true },
  accessibility: { fontSize: 16, highContrast: false, invertColors: false },
};

export default function SettingsPage() {
  const { setFontSize, setHighContrast, setInverted } = useAdminTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);

  const applyAccessibilitySettings = useCallback((a11y: SettingsData['accessibility']) => {
    setFontSize(a11y.fontSize);
    setHighContrast(Boolean(a11y.highContrast));
    setInverted(Boolean(a11y.invertColors));
  }, [setFontSize, setHighContrast, setInverted]);

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'users', name: 'User Settings', icon: Users },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
  ];

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const mergedSettings = {
            ...DEFAULT_SETTINGS,
            ...data.settings,
            accessibility: {
              ...DEFAULT_SETTINGS.accessibility,
              ...(data.settings.accessibility ?? {}),
            },
          };
          setSettings(mergedSettings);
          applyAccessibilitySettings(mergedSettings.accessibility);
        }
      }
    } catch {
      // use defaults
    } finally {
      setIsLoading(false);
    }
  }, [applyAccessibilitySettings]);

  const updateAccessibility = useCallback((nextAccessibility: SettingsData['accessibility']) => {
    setSettings(prev => ({
      ...prev,
      accessibility: nextAccessibility,
    }));
    applyAccessibilitySettings(nextAccessibility);
  }, [applyAccessibilitySettings]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateField = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]";
  const selectClass = `${inputClass} appearance-none cursor-pointer font-bold`;

  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
    <div className="flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-lg">
      <div>
        <p className="font-medium text-[var(--admin-text)]">{label}</p>
        <p className="text-sm text-[var(--admin-muted)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--admin-primary)]' : 'bg-[var(--admin-border)]'}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-light-surface rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--admin-muted)]">
        <Loader2 className="animate-spin mr-2" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight flex items-center gap-3">
            <SettingsIcon className="h-7 w-7 text-[var(--admin-primary)]" />
            System Settings
          </h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">
            Configure platform settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--admin-surface)] backdrop-blur-md rounded-xl border border-[var(--admin-border)] p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]'
                        : 'text-[var(--admin-muted)] hover:bg-[var(--admin-bg)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--admin-surface)] backdrop-blur-md rounded-xl border border-[var(--admin-border)] p-6">

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Platform Name</label>
                    <input type="text" value={settings.general.platformName} onChange={e => updateField('general', 'platformName', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Support Email</label>
                    <input type="email" value={settings.general.supportEmail} onChange={e => updateField('general', 'supportEmail', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Default Language</label>
                    <select value={settings.general.defaultLanguage} onChange={e => updateField('general', 'defaultLanguage', e.target.value)} className={selectClass}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Timezone</label>
                    <select value={settings.general.timezone} onChange={e => updateField('general', 'timezone', e.target.value)} className={selectClass}>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/Paris">Central European (CET)</option>
                      <option value="Asia/Tokyo">Japan (JST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={settings.security.requireEmailVerification}
                    onChange={v => updateField('security', 'requireEmailVerification', v)}
                    label="Require Email Verification"
                    description="Users must verify their email before accessing the platform"
                  />
                  <ToggleSwitch
                    checked={settings.security.twoFactorAuth}
                    onChange={v => updateField('security', 'twoFactorAuth', v)}
                    label="Two-Factor Authentication"
                    description="Enable 2FA for admin accounts"
                  />
                  <div className="flex items-center justify-between p-4 bg-[var(--admin-bg)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--admin-text)]">Session Timeout</p>
                      <p className="text-sm text-[var(--admin-muted)]">Auto-logout users after inactivity</p>
                    </div>
                    <select value={settings.security.sessionTimeout} onChange={e => updateField('security', 'sessionTimeout', Number(e.target.value))} className="px-3 py-1.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)]">
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">Email Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">SMTP Host</label>
                    <input type="text" value={settings.email.smtpHost} onChange={e => updateField('email', 'smtpHost', e.target.value)} placeholder="smtp.example.com" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">SMTP Port</label>
                      <input type="number" value={settings.email.smtpPort} onChange={e => updateField('email', 'smtpPort', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Encryption</label>
                      <select value={settings.email.encryption} onChange={e => updateField('email', 'encryption', e.target.value)} className={selectClass}>
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">From Email</label>
                    <input type="email" value={settings.email.fromEmail} onChange={e => updateField('email', 'fromEmail', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">Payment Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Payment Gateway</label>
                    <select value={settings.payments.gateway} onChange={e => updateField('payments', 'gateway', e.target.value)} className={selectClass}>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Platform Commission (%)</label>
                    <input type="number" value={settings.payments.commission} onChange={e => updateField('payments', 'commission', Number(e.target.value))} min={0} max={100} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Currency</label>
                    <select value={settings.payments.currency} onChange={e => updateField('payments', 'currency', e.target.value)} className={selectClass}>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* User Settings */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">User Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--admin-muted)] mb-2">Max Portfolio Items per User</label>
                    <input type="number" value={settings.users.maxPortfolioItems} onChange={e => updateField('users', 'maxPortfolioItems', Number(e.target.value))} min={1} max={500} className={inputClass} />
                  </div>
                  <ToggleSwitch
                    checked={settings.users.requireApproval}
                    onChange={v => updateField('users', 'requireApproval', v)}
                    label="Require Admin Approval"
                    description="New user profiles must be approved before they appear in search"
                  />
                  <ToggleSwitch
                    checked={settings.users.allowSelfDelete}
                    onChange={v => updateField('users', 'allowSelfDelete', v)}
                    label="Allow Account Self-Deletion"
                    description="Users can delete their own accounts from settings"
                  />
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <ToggleSwitch
                    checked={settings.notifications.emailOnNewUser}
                    onChange={v => updateField('notifications', 'emailOnNewUser', v)}
                    label="New User Registration"
                    description="Receive email notification when a new user signs up"
                  />
                  <ToggleSwitch
                    checked={settings.notifications.emailOnReport}
                    onChange={v => updateField('notifications', 'emailOnReport', v)}
                    label="New Report Submitted"
                    description="Receive email notification when a user submits a report"
                  />
                  <ToggleSwitch
                    checked={settings.notifications.emailOnPayment}
                    onChange={v => updateField('notifications', 'emailOnPayment', v)}
                    label="Payment Events"
                    description="Receive email notification for subscription payments"
                  />
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
                  <Accessibility className="h-5 w-5 text-[var(--admin-primary)]" />
                  Accessibility Settings
                </h2>
                <p className="text-sm text-[var(--admin-muted)]">
                  Adjust text size and display settings for better readability and visual comfort.
                </p>
                <div className="space-y-6">
                  {/* Font Size Slider */}
                  <div className="p-5 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)]">
                    <div className="flex items-center gap-3 mb-4">
                      <Type className="h-5 w-5 text-[var(--admin-primary)]" />
                      <div>
                        <p className="font-bold text-[var(--admin-text)]">Font Size</p>
                        <p className="text-sm text-[var(--admin-muted)]">Adjust the base font size for the admin panel</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-[var(--admin-muted)] w-6">A</span>
                        <input
                          type="range"
                          min={12}
                          max={24}
                          step={1}
                          value={settings.accessibility.fontSize}
                          onChange={e => {
                            const fontSize = Number(e.target.value);
                            updateAccessibility({ ...settings.accessibility, fontSize });
                          }}
                          className="flex-1 h-2 bg-[var(--admin-border)] rounded-full appearance-none cursor-pointer accent-[var(--admin-primary)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[var(--admin-primary)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                        <span className="text-xl font-bold text-[var(--admin-muted)] w-6">A</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--admin-muted)]">12px</span>
                        <span className="text-sm font-bold text-[var(--admin-primary)] bg-[var(--admin-primary)]/10 px-3 py-1 rounded-full">
                          {settings.accessibility.fontSize}px
                        </span>
                        <span className="text-xs text-[var(--admin-muted)]">24px</span>
                      </div>
                      {/* Preview */}
                      <div className="mt-3 p-4 bg-[var(--admin-surface)] rounded-lg border border-[var(--admin-border)]">
                        <p className="text-[var(--admin-muted)] text-xs font-bold uppercase tracking-wider mb-2">Preview</p>
                        <p style={{ fontSize: `${settings.accessibility.fontSize}px` }} className="text-[var(--admin-text)] leading-relaxed">
                          This is a preview of how text will appear at {settings.accessibility.fontSize}px. Adjust the slider above to find a comfortable reading size.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High Contrast Toggle */}
                  <div className="p-5 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Contrast className="h-5 w-5 text-[var(--admin-primary)]" />
                        <div>
                          <p className="font-bold text-[var(--admin-text)]">High Contrast</p>
                          <p className="text-sm text-[var(--admin-muted)]">Increase contrast to improve legibility of text and UI elements.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextHighContrast = !settings.accessibility.highContrast;
                          updateAccessibility({ ...settings.accessibility, highContrast: nextHighContrast });
                        }}
                        className={`relative w-14 h-7 rounded-full transition-colors shrink-0 ml-4 ${
                          settings.accessibility.highContrast ? 'bg-[var(--admin-primary)]' : 'bg-[var(--admin-border)]'
                        }`}
                        role="switch"
                        aria-checked={settings.accessibility.highContrast}
                        aria-label="Toggle high contrast"
                      >
                        <span className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] bg-light-surface rounded-full transition-transform shadow-sm ${
                          settings.accessibility.highContrast ? 'translate-x-7' : ''
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Invert Colors Toggle */}
                  <div className="p-5 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-[var(--admin-primary)]" />
                        <div>
                          <p className="font-bold text-[var(--admin-text)]">Invert Colours</p>
                          <p className="text-sm text-[var(--admin-muted)]">Invert the display colours for improved contrast and visual comfort. Helpful for users with light sensitivity or certain visual impairments.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextInverted = !settings.accessibility.invertColors;
                          updateAccessibility({ ...settings.accessibility, invertColors: nextInverted });
                        }}
                        className={`relative w-14 h-7 rounded-full transition-colors shrink-0 ml-4 ${
                          settings.accessibility.invertColors ? 'bg-[var(--admin-primary)]' : 'bg-[var(--admin-border)]'
                        }`}
                        role="switch"
                        aria-checked={settings.accessibility.invertColors}
                        aria-label="Toggle colour inversion"
                      >
                        <span className={`absolute top-[3px] left-[3px] w-[22px] h-[22px] bg-light-surface rounded-full transition-transform shadow-sm ${
                          settings.accessibility.invertColors ? 'translate-x-7' : ''
                        }`} />
                      </button>
                    </div>
                    {settings.accessibility.invertColors && (
                      <div className="mt-4 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          Colour inversion is active. UI colours are inverted while media is kept visually balanced for readability.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reset Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const resetAccessibility = { fontSize: 16, highContrast: false, invertColors: false };
                        updateAccessibility(resetAccessibility);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg hover:border-[var(--admin-primary)]/30 transition-all"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-[var(--admin-border)]">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-[var(--admin-primary)] hover:opacity-90 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
