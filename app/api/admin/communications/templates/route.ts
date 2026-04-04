import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

// System templates that match the existing Resend emails in lib/email/emailService.ts
// plus additional templates fitting the 3YESES talent platform
// Dark mode classes applied throughout for prefers-color-scheme:dark support
// Version is bumped whenever template content changes to trigger DB updates
const TEMPLATES_VERSION = 4;

const SYSTEM_TEMPLATES = [
  {
    id: 'email-verification',
    name: 'Email Verification',
    subject: 'Confirm your email — just one click to activate your profile',
    preheaderText: 'Verify your email address to unlock your 3YESES account.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Email Verification</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Join the talent revolution</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Confirm your email to access the platform connecting talent with opportunity in the entertainment industry.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{verificationUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Confirm Email</a>
  </td></tr>
</table>

<p style="margin:0 0 24px 0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
  If the button doesn&rsquo;t work, copy and paste this URL:<br>
  <span style="color:#1d4ed8;font-family:'Courier New',monospace;word-break:break-all;">{{verificationUrl}}</span>
</p>

<div style="border-left:3px solid #1d4ed8;background:#eff6ff;padding:14px 16px;border-radius:0 6px 6px 0;" class="dark-card dark-border">
  <p style="margin:0;font-size:13px;color:#1e3a8a;line-height:1.6;" class="dark-text"><strong>&#9202; 24-hour expiration</strong><br>This link expires in 24 hours for your security.</p>
</div>

<p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;" class="dark-subtle">If you didn&rsquo;t create an account, you can safely ignore this email.</p>`,
    variables: ['verificationUrl', 'email'],
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Reset your 3YESES password — secure link inside',
    preheaderText: 'A password reset was requested for your 3YESES account.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#fef2f2;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Password Reset</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Reset your password</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">We received a request to reset your 3YESES account password. Click below to create a new one.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{resetUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Reset Password</a>
  </td></tr>
</table>

<p style="margin:0 0 24px 0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
  If the button doesn&rsquo;t work, copy and paste this URL:<br>
  <span style="color:#1d4ed8;font-family:'Courier New',monospace;word-break:break-all;">{{resetUrl}}</span>
</p>

<div style="border-left:3px solid #ef4444;background:#fef2f2;padding:14px 16px;border-radius:0 6px 6px 0;" class="dark-card dark-border">
  <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;" class="dark-text"><strong>&#128274; Security Notice</strong><br>This link expires in 1 hour. If you didn&rsquo;t request this, ignore this email &mdash; your password remains unchanged.</p>
</div>`,
    variables: ['resetUrl', 'email'],
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    subject: 'Welcome to 3YESES — your talent journey starts now!',
    preheaderText: 'Your account is live — complete your profile and start connecting.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Account Activated</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Welcome, {{name}}!</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Your email is verified and your account is live. You&rsquo;re now part of the 3YESES community &mdash; where talent meets opportunity.</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 16px 0;font-size:16px;font-weight:700;color:#020617;" class="dark-heading">&#128640; Quick Start Guide</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:6px 0;font-size:14px;color:#475569;" class="dark-text">
      <span style="display:inline-block;width:28px;height:28px;background:#1d4ed8;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;margin-right:12px;">1</span>
      Complete your profile with photos &amp; bio
    </td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#475569;" class="dark-text">
      <span style="display:inline-block;width:28px;height:28px;background:#1d4ed8;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;margin-right:12px;">2</span>
      Upload your portfolio (images, videos, audio)
    </td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#475569;" class="dark-text">
      <span style="display:inline-block;width:28px;height:28px;background:#1d4ed8;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;margin-right:12px;">3</span>
      Subscribe for full Standard Access
    </td></tr>
    <tr><td style="padding:6px 0;font-size:14px;color:#475569;" class="dark-text">
      <span style="display:inline-block;width:28px;height:28px;background:#1d4ed8;color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;margin-right:12px;">4</span>
      Explore opportunities &amp; connect
    </td></tr>
  </table>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{dashboardUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Go to Dashboard</a>
  </td></tr>
</table>`,
    variables: ['name', 'email', 'dashboardUrl'],
  },
  {
    id: 'parental-consent',
    name: 'Parental Consent Request',
    subject: 'Parental Consent Required — {{childName}} wants to join 3YESES',
    preheaderText: '{{childName}} needs your consent to complete their 3YESES registration.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Parental Consent</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Consent Required for {{childName}}</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text"><strong>{{childName}}</strong> has created an account on 3YESES and needs your consent to complete registration.</p>

<div style="border-left:3px solid #1d4ed8;background:#eff6ff;padding:14px 16px;border-radius:0 6px 6px 0;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#1e3a8a;" class="dark-heading">&#8505;&#65039; What happens next?</p>
  <ul style="margin:0;padding-left:20px;font-size:14px;color:#475569;line-height:1.8;" class="dark-text">
    <li>{{childName}} will create and manage their own talent profile</li>
    <li>They can showcase skills and connect with opportunities</li>
    <li>Enhanced safety controls are active on their account</li>
    <li>You can monitor the account at any time</li>
  </ul>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{consentUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Review &amp; Provide Consent</a>
  </td></tr>
</table>

<p style="margin:0 0 24px 0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
  If the button doesn&rsquo;t work, copy and paste this URL:<br>
  <span style="color:#1d4ed8;font-family:'Courier New',monospace;word-break:break-all;">{{consentUrl}}</span>
</p>

<p style="font-size:12px;color:#94a3b8;margin:24px 0 0 0;" class="dark-subtle">This consent link expires in 48 hours. If you don&rsquo;t respond, the account will remain pending.</p>`,
    variables: ['childName', 'parentEmail', 'consentUrl'],
  },
  {
    id: 'subscription-confirmed',
    name: 'Subscription Confirmed',
    subject: 'Your 3YESES Standard Access is now active!',
    preheaderText: 'Standard Access unlocked — unlimited uploads, priority ranking and more.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Subscription Active</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Subscription Confirmed</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, your <strong>Standard Access</strong> subscription is now active. Here&rsquo;s everything you&rsquo;ve unlocked:</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Full profile customisation</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Unlimited portfolio uploads (images, videos, audio)</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Priority search ranking</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Full dashboard analytics</td></tr>
  </table>
</div>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0;" class="dark-card dark-border">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:14px;color:#475569;padding:4px 0;" class="dark-text"><strong>Plan:</strong> Standard Access &mdash; &pound;10 / 6 months</td></tr>
    <tr><td style="font-size:14px;color:#475569;padding:4px 0;" class="dark-text"><strong>Next renewal:</strong> {{renewalDate}}</td></tr>
  </table>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{dashboardUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Go to Dashboard</a>
  </td></tr>
</table>`,
    variables: ['name', 'email', 'renewalDate', 'dashboardUrl'],
  },
  {
    id: 'subscription-expiring',
    name: 'Subscription Expiring Soon',
    subject: 'Your 3YESES subscription expires soon — renew to keep your features',
    preheaderText: 'Your Standard Access expires on {{expiryDate}} — update payment to stay active.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#fef2f2;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Subscription Expiring</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Subscription Expiring Soon</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, your 3YESES Standard Access subscription will expire on <strong>{{expiryDate}}</strong>.</p>

<div style="border-left:3px solid #ef4444;background:#fef2f2;padding:14px 16px;border-radius:0 6px 6px 0;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;" class="dark-text"><strong>Don&rsquo;t lose access!</strong> Make sure your payment details are up to date to continue enjoying unlimited portfolio uploads, priority search ranking, and all premium features.</p>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{billingUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Manage Subscription</a>
  </td></tr>
</table>

<p style="font-size:13px;color:#94a3b8;margin:24px 0 0 0;" class="dark-subtle">If your subscription lapses, your profile will remain but premium features will be limited.</p>`,
    variables: ['name', 'email', 'expiryDate', 'billingUrl'],
  },
  {
    id: 'new-message',
    name: 'New Message Notification',
    subject: 'You have a new message on 3YESES from {{senderName}}',
    preheaderText: '{{senderName}} sent you a message — tap to read and reply.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">New Message</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">New Message</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{recipientName}}, <strong>{{senderName}}</strong> sent you a message on 3YESES.</p>

<div style="background:#f8fafc;border-left:3px solid #1d4ed8;border-radius:0 8px 8px 0;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.8px;">Message Preview</p>
  <p style="margin:0;font-size:15px;color:#475569;font-style:italic;line-height:1.6;" class="dark-text">{{messagePreview}}</p>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{messageUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">View Message</a>
  </td></tr>
</table>`,
    variables: ['recipientName', 'senderName', 'messagePreview', 'messageUrl'],
  },
  {
    id: 'profile-approved',
    name: 'Profile Approved',
    subject: 'Your 3YESES talent profile has been approved!',
    preheaderText: 'Great news — your talent profile is live and visible to clients.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Profile Approved</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Profile Approved!</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, great news &mdash; your talent profile has been reviewed and approved! You&rsquo;re now visible to clients and other users searching for talent.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#166534;" class="dark-heading">What&rsquo;s next?</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#128248; Add more portfolio items to stand out</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#128269; Optimise your profile with skills and tags</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#128200; Check your analytics dashboard</td></tr>
  </table>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{profileUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">View Your Profile</a>
  </td></tr>
</table>`,
    variables: ['name', 'email', 'profileUrl'],
  },
  {
    id: 'account-warning',
    name: 'Account Warning',
    subject: 'Important: Warning notice for your 3YESES account',
    preheaderText: 'A warning has been issued on your 3YESES account — please review.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Account Warning</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Account Warning</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, we&rsquo;re writing to inform you that a warning has been issued on your 3YESES account.</p>

<div style="border-left:3px solid #f59e0b;background:#fef3c7;padding:14px 16px;border-radius:0 6px 6px 0;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.8px;" class="dark-subtle">Reason</p>
  <p style="margin:0;font-size:15px;color:#92400e;" class="dark-text">{{reason}}</p>
</div>

<p style="color:#475569;font-size:15px;line-height:1.7;" class="dark-text">Please review our <a href="{{termsUrl}}" style="color:#1d4ed8;font-weight:600;">community guidelines</a> to ensure your account remains in good standing. Repeated violations may result in suspension or ban.</p>

<p style="color:#475569;font-size:15px;line-height:1.7;" class="dark-text">If you believe this warning was issued in error, please <a href="{{contactUrl}}" style="color:#1d4ed8;font-weight:600;">contact support</a>.</p>`,
    variables: ['name', 'email', 'reason', 'termsUrl', 'contactUrl'],
  },
  {
    id: 'account-banned',
    name: 'Account Banned',
    subject: 'Your 3YESES account has been suspended',
    preheaderText: 'Your account has been suspended due to a community guidelines violation.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#fef2f2;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Account Suspended</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Account Suspended</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, your 3YESES account has been suspended due to a violation of our community guidelines.</p>

<div style="border-left:3px solid #ef4444;background:#fef2f2;padding:14px 16px;border-radius:0 6px 6px 0;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.8px;" class="dark-subtle">Reason</p>
  <p style="margin:0;font-size:15px;color:#991b1b;" class="dark-text">{{reason}}</p>
</div>

<p style="color:#475569;font-size:15px;line-height:1.7;" class="dark-text">While suspended, you will not be able to access your profile, portfolio, or subscription features.</p>

<p style="color:#475569;font-size:15px;line-height:1.7;" class="dark-text">If you believe this action was taken in error, you may appeal by contacting our support team.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{contactUrl}}" style="display:inline-block;background:#64748b;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;">Contact Support</a>
  </td></tr>
</table>`,
    variables: ['name', 'email', 'reason', 'contactUrl'],
  },
  // ── New templates v4 ─────────────────────────────────────────────
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    subject: 'Your 3YESES payment receipt — {{amount}}',
    preheaderText: 'Payment of {{amount}} received — here is your receipt.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Payment Receipt</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Payment Received</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, thank you for your payment. Here is your receipt.</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:14px;color:#475569;padding:6px 0;border-bottom:1px solid #e2e8f0;" class="dark-text dark-border"><strong>Amount:</strong></td><td style="font-size:14px;color:#020617;padding:6px 0;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:700;" class="dark-heading dark-border">{{amount}}</td></tr>
    <tr><td style="font-size:14px;color:#475569;padding:6px 0;border-bottom:1px solid #e2e8f0;" class="dark-text dark-border"><strong>Currency:</strong></td><td style="font-size:14px;color:#020617;padding:6px 0;text-align:right;border-bottom:1px solid #e2e8f0;" class="dark-heading dark-border">{{currency}}</td></tr>
    <tr><td style="font-size:14px;color:#475569;padding:6px 0;border-bottom:1px solid #e2e8f0;" class="dark-text dark-border"><strong>Date:</strong></td><td style="font-size:14px;color:#020617;padding:6px 0;text-align:right;border-bottom:1px solid #e2e8f0;" class="dark-heading dark-border">{{invoiceDate}}</td></tr>
    <tr><td style="font-size:14px;color:#475569;padding:6px 0;" class="dark-text"><strong>Plan:</strong></td><td style="font-size:14px;color:#020617;padding:6px 0;text-align:right;" class="dark-heading">Standard Access</td></tr>
  </table>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{invoiceUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">View Invoice</a>
  </td></tr>
</table>

<p style="font-size:12px;color:#94a3b8;margin:24px 0 0 0;" class="dark-subtle">This receipt was sent automatically. If you have questions about this charge, please contact support.</p>`,
    variables: ['name', 'email', 'amount', 'currency', 'invoiceDate', 'invoiceUrl'],
  },
  {
    id: 'profile-views',
    name: 'Profile Views Digest',
    subject: 'Your profile was viewed {{viewCount}} times this {{period}}',
    preheaderText: '{{viewCount}} people viewed your profile this {{period}} — see who is discovering you.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Profile Insights</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Profile Views Update</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, here&rsquo;s a quick look at your profile activity this {{period}}.</p>

<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:24px;margin:24px 0;text-align:center;" class="dark-card dark-border">
  <p style="margin:0 0 4px 0;font-size:40px;font-weight:800;color:#1d4ed8;line-height:1;">{{viewCount}}</p>
  <p style="margin:0;font-size:14px;color:#475569;font-weight:600;" class="dark-text">profile views this {{period}}</p>
</div>

<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Keep your profile fresh with new portfolio items and updated skills to attract even more attention.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{dashboardUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">View Analytics</a>
  </td></tr>
</table>`,
    variables: ['name', 'viewCount', 'period', 'dashboardUrl'],
  },
  {
    id: 'portfolio-engagement',
    name: 'Portfolio Engagement',
    subject: 'Your portfolio item "{{itemTitle}}" is getting noticed!',
    preheaderText: '"{{itemTitle}}" received {{viewCount}} views — see the full breakdown.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#faf5ff;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Portfolio Insights</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Your Portfolio is Getting Noticed</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, your portfolio item <strong>&ldquo;{{itemTitle}}&rdquo;</strong> is attracting attention!</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center;padding:12px 8px;">
        <p style="margin:0 0 4px 0;font-size:28px;font-weight:800;color:#1d4ed8;line-height:1;">{{viewCount}}</p>
        <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;" class="dark-subtle">Views</p>
      </td>
      <td style="text-align:center;padding:12px 8px;border-left:1px solid #e2e8f0;" class="dark-border">
        <p style="margin:0 0 4px 0;font-size:28px;font-weight:800;color:#ef4444;line-height:1;">{{likeCount}}</p>
        <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;" class="dark-subtle">Likes</p>
      </td>
    </tr>
  </table>
</div>

<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Add more portfolio items to increase your visibility and attract new connections.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{dashboardUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">View Dashboard</a>
  </td></tr>
</table>`,
    variables: ['name', 'itemTitle', 'viewCount', 'likeCount', 'dashboardUrl'],
  },
  {
    id: 're-engagement',
    name: 'Re-engagement',
    subject: 'We miss you on 3YESES, {{name}} — new opportunities await',
    preheaderText: 'It has been a while — come back and see what is new on 3YESES.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">We Miss You</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">It&rsquo;s been a while, {{name}}</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">We noticed you haven&rsquo;t logged in since <strong>{{lastActiveDate}}</strong>. The 3YESES community has been growing &mdash; here&rsquo;s what you might be missing:</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#127775; New talent profiles in your category</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#128172; Unread messages waiting for you</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#128200; Fresh dashboard analytics &amp; insights</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#475569;" class="dark-text">&#128247; New portfolio showcase features</td></tr>
  </table>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{dashboardUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Return to Dashboard</a>
  </td></tr>
</table>

<p style="font-size:13px;color:#94a3b8;margin:24px 0 0 0;" class="dark-subtle">If you no longer wish to receive these emails, you can unsubscribe at any time.</p>`,
    variables: ['name', 'lastActiveDate', 'dashboardUrl'],
  },
  {
    id: 'subscription-cancelled',
    name: 'Subscription Cancelled',
    subject: 'Your 3YESES subscription has been cancelled',
    preheaderText: 'Your Standard Access will remain active until {{endDate}}.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#fef2f2;color:#ef4444;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Subscription Cancelled</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Subscription Cancelled</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, your Standard Access subscription has been cancelled. Your premium features will remain active until <strong>{{endDate}}</strong>.</p>

<div style="border-left:3px solid #ef4444;background:#fef2f2;padding:14px 16px;border-radius:0 6px 6px 0;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#991b1b;" class="dark-heading">After {{endDate}} you will lose:</p>
  <ul style="margin:0;padding-left:20px;font-size:14px;color:#991b1b;line-height:1.8;" class="dark-text">
    <li>Priority search ranking</li>
    <li>Unlimited portfolio uploads</li>
    <li>Full dashboard analytics</li>
  </ul>
</div>

<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Changed your mind? You can resubscribe at any time to restore full access.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{resubscribeUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Resubscribe Now</a>
  </td></tr>
</table>`,
    variables: ['name', 'email', 'endDate', 'resubscribeUrl'],
  },
  {
    id: 'subscription-renewed',
    name: 'Subscription Renewed',
    subject: 'Your 3YESES subscription has been renewed!',
    preheaderText: 'Payment of {{amount}} processed — your Standard Access continues.',
    body: `<div style="margin-bottom:8px;">
  <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card">Subscription Renewed</span>
</div>

<h2 style="color:#020617;margin:0 0 8px 0;font-size:28px;font-weight:800;line-height:1.2;" class="dark-heading">Subscription Renewed</h2>
<p style="color:#475569;margin:0 0 24px 0;font-size:15px;line-height:1.7;" class="dark-text">Hi {{name}}, your Standard Access subscription has been successfully renewed. Thank you for continuing with 3YESES!</p>

<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0;" class="dark-card dark-border">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-size:14px;color:#475569;padding:4px 0;" class="dark-text"><strong>Amount charged:</strong> {{amount}}</td></tr>
    <tr><td style="font-size:14px;color:#475569;padding:4px 0;" class="dark-text"><strong>Next renewal:</strong> {{nextRenewalDate}}</td></tr>
    <tr><td style="font-size:14px;color:#475569;padding:4px 0;" class="dark-text"><strong>Plan:</strong> Standard Access</td></tr>
  </table>
</div>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;" class="dark-card dark-border">
  <p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#166534;" class="dark-heading">Your active benefits:</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Priority search ranking</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Unlimited portfolio uploads</td></tr>
    <tr><td style="padding:5px 0;font-size:14px;color:#166534;" class="dark-text">&#10003; Full dashboard analytics</td></tr>
  </table>
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr><td align="center">
    <a href="{{billingUrl}}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(29,78,216,0.35);">Manage Billing</a>
  </td></tr>
</table>`,
    variables: ['name', 'email', 'amount', 'nextRenewalDate', 'billingUrl'],
  },
];

async function seedSystemTemplates() {
  // Always upsert system templates to keep branding and content up-to-date
  for (const template of SYSTEM_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        preheaderText: template.preheaderText || null,
      },
      create: {
        id: template.id,
        name: template.name,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        preheaderText: template.preheaderText || null,
      },
    });
  }
}

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        // Seed system templates if table is empty
        await seedSystemTemplates();

        const templates = await prisma.emailTemplate.findMany({
            orderBy: { lastUpdated: 'desc' }
        });
        return NextResponse.json(templates);
    } catch (error) {
        console.error("Failed to fetch email templates:", error);
        return NextResponse.json({ error: "Failed to fetch email templates" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        const body = await req.json();
        const { id, name, subject, body: templateBody, variables, preheaderText } = body;

        // Validation
        if (!id || !name || !subject || !templateBody) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const template = await prisma.emailTemplate.create({
            data: {
                id,
                name,
                subject,
                body: templateBody,
                variables: variables || [],
                preheaderText: preheaderText || null,
            }
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Failed to create email template:", error);
        return NextResponse.json({ error: "Failed to create email template" }, { status: 500 });
    }
}
