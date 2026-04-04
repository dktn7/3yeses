'use client';

import { Shield, Lock, Key, AlertTriangle, Monitor, Users, Database, Wifi, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminSecurityGuidelinesPage() {
  const lastUpdated = '27 February 2026';

  const guidelines = [
    {
      icon: <Key size={20} />,
      title: '1. Authentication & Access Control',
      severity: 'critical',
      items: [
        'Use a strong, unique password for your admin account (minimum 12 characters with uppercase, lowercase, numbers, and symbols).',
        'Never share your admin credentials with anyone, including other administrators.',
        'Log out of the Admin Portal when you are finished or stepping away from your workstation.',
        'Admin sessions expire automatically after a period of inactivity. If prompted to log in again, do not consider this an error.',
        'If you suspect your admin credentials have been compromised, change your password immediately and notify the platform owner.',
        'Admin access tokens (JWT) are stored in HTTP-only cookies and cannot be accessed by JavaScript. Do not attempt to extract or copy these tokens.',
        'Two-factor authentication (2FA) should be enabled when available.',
      ],
    },
    {
      icon: <Monitor size={20} />,
      title: '2. Workstation Security',
      severity: 'high',
      items: [
        'Only access the Admin Portal from trusted, secure devices.',
        'Keep your operating system, browser, and security software up to date.',
        'Do not access the Admin Portal on public or shared computers.',
        'Use a modern, up-to-date web browser (Chrome, Firefox, Edge, or Safari).',
        'Enable your device\'s screen lock and use it when stepping away.',
        'Do not install browser extensions that could intercept admin data.',
        'Ensure your network connection is secure — avoid public Wi-Fi without a VPN.',
      ],
    },
    {
      icon: <Database size={20} />,
      title: '3. Data Handling',
      severity: 'critical',
      items: [
        'Never export or download user personal data unless absolutely necessary and authorised.',
        'Do not copy user data (names, emails, financial details) to personal notes, spreadsheets, or external systems.',
        'Screenshots containing user personal data should not be shared externally.',
        'When discussing user issues, use anonymised references (user IDs) rather than full names or emails where possible.',
        'Deleted user data should be treated as permanently removed. Do not attempt to recover or retain deleted data.',
        'Financial data (payment amounts, Stripe IDs) should only be accessed for legitimate transaction queries or dispute resolution.',
        'Do not modify database records directly — always use the Admin Portal interface.',
      ],
    },
    {
      icon: <Shield size={20} />,
      title: '4. API Keys & Secrets',
      severity: 'critical',
      items: [
        'API keys displayed in the Admin Portal are partially masked for security. Treat any unmasked key values as highly sensitive.',
        'Never commit API keys, database credentials, or JWT secrets to version control (Git).',
        'Store all sensitive configuration in environment variables (.env.local), never in source code.',
        'Rotate API keys periodically, especially if a team member\'s access is revoked.',
        'The Stripe secret key, JWT secrets, and database URL should never be logged, displayed in full, or sent via email.',
        'If an API key is suspected to be compromised, rotate it immediately and audit recent usage.',
      ],
    },
    {
      icon: <Users size={20} />,
      title: '5. User Account Management',
      severity: 'high',
      items: [
        'Verify the identity of any user before making account changes (role changes, password resets, subscription overrides).',
        'Document the reason for any manual role change or subscription override in the relevant admin interface.',
        'Be cautious when deleting user accounts — this action may be irreversible and should follow proper procedures.',
        'When banning or suspending a user, always provide a clear reason that will be visible in the Audit Log.',
        'Do not create test accounts with ADMIN privileges on production. Use the designated test environment.',
        'Review user reports objectively and follow the moderation guidelines consistently.',
      ],
    },
    {
      icon: <Wifi size={20} />,
      title: '6. Network & Communication Security',
      severity: 'high',
      items: [
        'The Admin Portal is served over HTTPS. Never access it via plain HTTP.',
        'All API communications between the Admin Portal and the server use encrypted connections.',
        'Do not bypass SSL/TLS certificate warnings when accessing the admin interface.',
        'Admin-related communications (discussing user issues, platform incidents) should use secure channels only.',
        'Do not send user personal data via unencrypted email.',
        'Webhook endpoints (e.g., Stripe webhooks) use signature verification to prevent tampering.',
      ],
    },
    {
      icon: <Eye size={20} />,
      title: '7. Audit & Monitoring',
      severity: 'medium',
      items: [
        'All admin actions are recorded in the Audit Log with timestamps, action types, and the admin user ID.',
        'The Audit Log is append-only and cannot be modified or deleted by administrators.',
        'Regularly review the Audit Log for unusual activity or unauthorised access attempts.',
        'System metrics (CPU, memory, API errors) are monitored in the System Health dashboard.',
        'Failed login attempts to the Admin Portal are logged and monitored.',
        'Report any suspicious activity or anomalies to the platform owner immediately.',
      ],
    },
    {
      icon: <AlertTriangle size={20} />,
      title: '8. Incident Response',
      severity: 'critical',
      items: [
        'If you discover a security vulnerability, report it privately to the platform owner. Do not disclose it publicly.',
        'In the event of a data breach, follow the Data Breach Response procedure in the Admin Privacy Policy.',
        'If the platform is under attack (DDoS, brute force, etc.), enable maintenance mode and notify the technical team.',
        'Preserve evidence of any security incident — do not delete logs or modify affected records.',
        'After a security incident, participate in the post-mortem review and implement recommended changes.',
        'Keep a record of all security-related decisions and actions taken during an incident.',
      ],
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-red-500/10 text-red-500">Critical</span>;
      case 'high':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">High</span>;
      case 'medium':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">Standard</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">Security Guidelines</h1>
            <p className="text-[var(--admin-muted)] font-medium text-sm">3YESES Talent Marketplace &middot; Admin Portal</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--admin-muted)]">
          <span className="bg-[var(--admin-bg)] border border-[var(--admin-border)] px-3 py-1 rounded-full font-bold">
            Last updated: {lastUpdated}
          </span>
          <span className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full font-bold text-red-500">
            Mandatory Reading
          </span>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-sm font-black text-[var(--admin-text)] mb-2">Important Notice</h2>
            <p className="text-sm text-[var(--admin-text)]/80 leading-relaxed">
              These security guidelines are <strong>mandatory</strong> for all 3YESES administrators. Failure to follow
              these guidelines may result in revocation of admin access and may constitute a breach of data protection
              obligations. If you are unsure about any guideline, contact the platform owner before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] mb-4">Quick Reference</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-4 text-center">
            <Lock className="mx-auto mb-2 text-[var(--admin-primary)]" size={24} />
            <p className="text-xs font-bold text-[var(--admin-text)]">Use Strong Passwords</p>
            <p className="text-[10px] text-[var(--admin-muted)] mt-1">12+ chars, mixed case, numbers, symbols</p>
          </div>
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-4 text-center">
            <Eye className="mx-auto mb-2 text-[var(--admin-primary)]" size={24} />
            <p className="text-xs font-bold text-[var(--admin-text)]">Minimise Data Access</p>
            <p className="text-[10px] text-[var(--admin-muted)] mt-1">Only access what you need</p>
          </div>
          <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 text-[var(--admin-primary)]" size={24} />
            <p className="text-xs font-bold text-[var(--admin-text)]">Report Incidents</p>
            <p className="text-[10px] text-[var(--admin-muted)] mt-1">Immediately notify the platform owner</p>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="space-y-4">
        {guidelines.map((section, idx) => (
          <div
            key={idx}
            className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
              <div className="flex items-center gap-3">
                <div className="text-[var(--admin-primary)]">{section.icon}</div>
                <h2 className="text-base font-black text-[var(--admin-text)]">{section.title}</h2>
              </div>
              {getSeverityBadge(section.severity)}
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                    <span className="text-sm text-[var(--admin-text)]/80 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Acknowledgement */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] mb-3">Acknowledgement</h2>
        <p className="text-sm text-[var(--admin-text)]/80 leading-relaxed">
          By accessing the 3YESES Admin Portal, you acknowledge that you have read, understood, and agree
          to comply with these Security Guidelines and the{' '}
          <Link href="/admin/privacy" className="text-[var(--admin-primary)] hover:opacity-80 font-bold">
            Admin Privacy Policy
          </Link>
          . Violations may result in immediate revocation of admin access and further action as appropriate.
        </p>
      </div>

      {/* Footer links */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--admin-muted)]">
          &copy; {new Date().getFullYear()} 3YESES. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/admin/privacy"
            className="text-xs font-bold text-[var(--admin-primary)] hover:opacity-80 transition-opacity"
          >
            Privacy Policy &rarr;
          </Link>
          <Link
            href="/admin/audit"
            className="text-xs font-bold text-[var(--admin-primary)] hover:opacity-80 transition-opacity"
          >
            Audit Log &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
