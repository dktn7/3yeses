'use client';

import { Shield, Lock, Eye, Database, UserCheck, Globe, AlertTriangle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AdminPrivacyPolicyPage() {
  const lastUpdated = '27 February 2026';

  const sections = [
    {
      icon: <Eye size={20} />,
      title: '1. Scope & Purpose',
      content: `This Admin Privacy Policy governs the collection, processing, and storage of data accessed through the 3YESES Admin Portal. It applies to all authorised administrators who manage the 3YESES talent marketplace platform.

The Admin Portal provides access to sensitive user data, financial records, and platform analytics. This policy outlines the responsibilities and restrictions placed on administrators to ensure compliance with data protection regulations, including the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.`,
    },
    {
      icon: <Database size={20} />,
      title: '2. Data Collected & Processed',
      content: `Through the Admin Portal, administrators may access the following categories of data:

• **User Personal Data** – Names, email addresses, phone numbers, profile photos, and biographical information provided by platform users.
• **Talent Profiles** – Portfolio items (images, videos, audio), skills, locations, categories, and professional details.
• **Financial Data** – Subscription records, payment history, Stripe transaction IDs, and billing information. Note: full card numbers are never stored or displayed; all payment processing is handled by Stripe.
• **Authentication Data** – Login timestamps, IP addresses (hashed), session tokens, and password reset requests. Passwords are stored using bcrypt hashing and are never accessible in plaintext.
• **Analytics Data** – Profile views, search appearances, portfolio engagement metrics, and platform usage statistics.
• **System Logs** – API request logs, error logs, admin actions, and audit trail entries.
• **Communications** – Support tickets, admin notes, and system notifications.`,
    },
    {
      icon: <UserCheck size={20} />,
      title: '3. Admin Access & Authorisation',
      content: `Access to the Admin Portal is strictly limited to users with the ADMIN role. All admin sessions use JSON Web Tokens (JWT) stored in HTTP-only cookies, which expire after a defined period.

**Access Controls:**
• Only the platform owner can grant ADMIN privileges.
• Admin accounts require email verification and strong passwords.
• All admin actions are recorded in the Audit Log with timestamps and user identification.
• Session tokens are automatically revoked after periods of inactivity.
• Admin access can be revoked immediately by changing the user's role.`,
    },
    {
      icon: <Lock size={20} />,
      title: '4. Data Protection Principles',
      content: `All administrators must adhere to the following data protection principles:

• **Lawfulness & Fairness** – User data may only be accessed for legitimate platform management purposes.
• **Purpose Limitation** – Data accessed via the Admin Portal must only be used for its intended purpose (e.g., user support, content moderation, fraud prevention).
• **Data Minimisation** – Administrators should only access the minimum data necessary to perform their tasks.
• **Accuracy** – Administrators must ensure that any corrections to user data are accurate and documented.
• **Storage Limitation** – Deleted user accounts have their personal data anonymised or removed within 30 days.
• **Integrity & Confidentiality** – All data transmissions use TLS encryption. Database connections use encrypted channels.`,
    },
    {
      icon: <AlertTriangle size={20} />,
      title: '5. Prohibited Actions',
      content: `Administrators are strictly prohibited from:

• Exporting personal user data for external use without explicit authorisation.
• Sharing admin credentials with any third party.
• Accessing user data for personal reasons unrelated to platform management.
• Modifying user financial records without proper documentation.
• Disabling security features or audit logging.
• Using admin access to gain unfair advantages on the platform.
• Storing user data on personal devices or unsecured systems.
• Sharing screenshots or exports containing user personal data externally.`,
    },
    {
      icon: <Globe size={20} />,
      title: '6. Third-Party Services',
      content: `The 3YESES platform integrates with the following third-party services that process user data:

• **Stripe** – Payment processing for subscriptions. Stripe handles all card data directly; 3YESES never stores full card numbers. Stripe's privacy policy applies to payment data.
• **ImageKit** – Media asset storage, transformation, and delivery for user-uploaded images, videos, and audio files.
• **Resend** – Transactional email delivery for verification emails, notifications, and communications.
• **PostgreSQL (hosted)** – Primary database for all platform data, encrypted at rest and in transit.

Administrators should be aware that data shared with these services is governed by their respective privacy policies and data processing agreements.`,
    },
    {
      icon: <Shield size={20} />,
      title: '7. Data Breach Response',
      content: `In the event of a suspected data breach:

1. **Immediate Action** – The administrator who discovers the breach must report it immediately to the platform owner.
2. **Assessment** – The scope and nature of the breach will be assessed within 24 hours.
3. **Notification** – If the breach poses a risk to individuals' rights and freedoms, the ICO (Information Commissioner's Office) will be notified within 72 hours as required by UK GDPR.
4. **User Notification** – Affected users will be notified without undue delay if the breach is likely to result in high risk to their rights and freedoms.
5. **Remediation** – Security measures will be updated to prevent recurrence, and the incident will be documented in the Audit Log.`,
    },
    {
      icon: <Mail size={20} />,
      title: '8. Contact & Enquiries',
      content: `For questions about this Admin Privacy Policy or data protection matters:

    • **Email:** privacy@3yeses.online
• **Admin Support:** Use the Support Centre within the Admin Portal
• **Data Subject Requests:** Users may submit data access, correction, or deletion requests through the platform. Administrators must process these within 30 days.

This policy is reviewed and updated periodically. Administrators will be notified of any material changes.`,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">Admin Privacy Policy</h1>
            <p className="text-[var(--admin-muted)] font-medium text-sm">3YESES Talent Marketplace &middot; Admin Portal</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--admin-muted)]">
          <span className="bg-[var(--admin-bg)] border border-[var(--admin-border)] px-3 py-1 rounded-full font-bold">
            Last updated: {lastUpdated}
          </span>
          <span className="bg-[var(--admin-bg)] border border-[var(--admin-border)] px-3 py-1 rounded-full font-bold">
            Version 1.0
          </span>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
        <p className="text-sm text-[var(--admin-text)] leading-relaxed">
          This privacy policy applies to the <strong>3YESES Admin Portal</strong> and outlines how administrator data
          and user data accessed via the admin interface is handled, protected, and governed. All administrators
          must read and understand this policy before accessing the Admin Portal.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden"
          >
            <div className="flex items-center gap-3 p-5 border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/50">
              <div className="text-[var(--admin-primary)]">{section.icon}</div>
              <h2 className="text-base font-black text-[var(--admin-text)]">{section.title}</h2>
            </div>
            <div className="p-5">
              <div className="text-sm text-[var(--admin-text)]/80 leading-relaxed whitespace-pre-line prose-strong:text-[var(--admin-text)] prose-strong:font-bold">
                {section.content.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--admin-muted)]">
          &copy; {new Date().getFullYear()} 3YESES. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link
            href="/admin/security"
            className="text-xs font-bold text-[var(--admin-primary)] hover:opacity-80 transition-opacity"
          >
            Security Guidelines &rarr;
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
