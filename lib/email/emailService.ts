import { Resend } from 'resend';
import { wrapEmailContent, getUnsubscribeHeaders } from './emailWrapper';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use Resend's verified testing domain by default
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_NAME = '3YESES';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

function withEmailUtm(url: string, campaign: string, content?: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('utm_source', '3yeses-email');
    parsed.searchParams.set('utm_medium', 'transactional');
    parsed.searchParams.set('utm_campaign', campaign);
    if (content) parsed.searchParams.set('utm_content', content);
    return parsed.toString();
  } catch {
    return url;
  }
}

// Rate limiting: Track last email send time
let lastEmailTime = 0;
const MIN_EMAIL_INTERVAL = 500; // 500ms = 2 emails per second max

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

async function sendEmail({ to, subject, html, headers }: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not set. Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('---');
      console.log(html);
      console.log('---');
      return { success: true, messageId: 'dev-mode' };
    }

    // Rate limiting: Wait if needed to avoid "Too many requests"
    const now = Date.now();
    const timeSinceLastEmail = now - lastEmailTime;
    if (timeSinceLastEmail < MIN_EMAIL_INTERVAL) {
      const waitTime = MIN_EMAIL_INTERVAL - timeSinceLastEmail;
      console.log(`⏱️  Rate limiting: Waiting ${waitTime}ms before sending...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      headers: {
        ...getUnsubscribeHeaders(to),
        ...headers,
      },
    });

    lastEmailTime = Date.now();

    if (data.error) {
      throw new Error(data.error.message);
    }

    console.log('✅ Email sent successfully:', { to, subject, messageId: data.data?.id });
    return { success: true, messageId: data.data?.id || 'unknown' };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

// ── DB-driven template rendering ──

/**
 * Interpolates {{variable}} placeholders in a template string.
 */
function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);
}

/**
 * Loads a template from DB and renders it with variables.
 * Returns null if the template doesn't exist in DB.
 */
async function renderDbTemplate(
  templateId: string,
  vars: Record<string, string>,
  recipientEmail: string,
): Promise<{ subject: string; html: string; preheaderText: string } | null> {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) return null;

    const subject = interpolateTemplate(template.subject, vars);
    const body = interpolateTemplate(template.body, vars);
    const preheaderText = template.preheaderText
      ? interpolateTemplate(template.preheaderText, vars)
      : '';

    const html = wrapEmailContent(body, {
      subject,
      recipientEmail,
      preheaderText,
    });

    return { subject, html, preheaderText };
  } catch (error) {
    console.warn(`⚠️  Could not load DB template "${templateId}", using hardcoded fallback:`, error);
    return null;
  }
}

export async function sendVerificationEmail(email: string, token: string, locale: string = 'en') {
  const verificationUrl = withEmailUtm(`${APP_URL}/${locale}/auth/verify-email?token=${token}`, 'email-verification', 'primary-cta');
  const contactUrl = withEmailUtm(`${APP_URL}/contact`, 'email-verification', 'support-link');

  // Try DB template first (allows admin customization)
  const dbResult = await renderDbTemplate('email-verification', {
    verificationUrl,
    email,
  }, email);

  if (dbResult) {
    return sendEmail({ to: email, subject: dbResult.subject, html: dbResult.html });
  }

  // Hardcoded fallback
  const subject = 'Verify Your Email Address';

  const innerHtml = `
    <!-- Context label -->
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card dark-text">Email Verification</span>
    </div>

    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#020617;line-height:1.2;letter-spacing:-0.5px;" class="dark-heading mobile-h1">
      Verify Your Email
    </h1>

    <p style="margin:0 0 28px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      Welcome to ${APP_NAME}! Please confirm your email address to activate your account and start showcasing your talent.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationUrl}" style="height:50px;v-text-anchor:middle;width:260px;" arcsize="16%" stroke="f" fillcolor="#1d4ed8">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Verify Email Address</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${verificationUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 44px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 14px rgba(29,78,216,0.35);min-width:200px;text-align:center;">
            Verify Email Address
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <p style="margin:0 0 28px 0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
      If the button doesn&rsquo;t work, copy and paste this URL:<br>
      <span style="color:#1d4ed8;font-family:'Courier New',monospace;word-break:break-all;">${verificationUrl}</span>
    </p>

    <!-- Security note -->
    <div style="border-left:3px solid #1d4ed8;background:#eff6ff;padding:14px 16px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">
        <strong>&#9202; Expires in 24 hours</strong><br>
        If you didn&rsquo;t create an account on ${APP_NAME}, you can safely ignore this email.
      </p>
    </div>

    <!-- Help -->
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;" class="dark-border">
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
        Need help? <a href="${contactUrl}" style="color:#1d4ed8;text-decoration:none;font-weight:500;">Contact Support</a>
      </p>
    </div>
  `;

  const html = wrapEmailContent(innerHtml, {
    subject,
    recipientEmail: email,
    preheaderText: `Welcome to ${APP_NAME}! Please verify your email address to get started.`,
  });

  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string = 'en') {
  const resetUrl = withEmailUtm(`${APP_URL}/${locale}/auth/reset-password?token=${token}`, 'password-reset', 'primary-cta');
  const contactUrl = withEmailUtm(`${APP_URL}/contact`, 'password-reset', 'support-link');

  // Try DB template first
  const dbResult = await renderDbTemplate('password-reset', {
    resetUrl,
    email,
  }, email);

  if (dbResult) {
    return sendEmail({ to: email, subject: dbResult.subject, html: dbResult.html });
  }

  // Hardcoded fallback
  const subject = 'Reset Your Password';

  const innerHtml = `
    <!-- Context label -->
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#fef2f2;color:#B91C1C;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card dark-text">Password Reset</span>
    </div>

    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#020617;line-height:1.2;letter-spacing:-0.5px;" class="dark-heading mobile-h1">
      Reset Your Password
    </h1>

    <p style="margin:0 0 28px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      We received a request to reset the password for your ${APP_NAME} account. Click the button below to create a new password.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:50px;v-text-anchor:middle;width:220px;" arcsize="16%" stroke="f" fillcolor="#1d4ed8">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Reset Password</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 44px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 14px rgba(29,78,216,0.35);min-width:200px;text-align:center;">
            Reset Password
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <p style="margin:0 0 28px 0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
      If the button doesn&rsquo;t work, copy and paste this URL:<br>
      <span style="color:#1d4ed8;font-family:'Courier New',monospace;word-break:break-all;">${resetUrl}</span>
    </p>

    <!-- Security note -->
    <div style="border-left:3px solid #B91C1C;background:#fef2f2;padding:14px 16px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
        <strong>&#128274; Security Notice</strong><br>
        This link expires in 1 hour. If you didn&rsquo;t request this, please ignore this email &mdash; your password will remain unchanged.
      </p>
    </div>

    <!-- Help -->
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;" class="dark-border">
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
        Having trouble? <a href="${contactUrl}" style="color:#1d4ed8;text-decoration:none;font-weight:500;">Contact Support</a>
      </p>
    </div>
  `;

  const html = wrapEmailContent(innerHtml, {
    subject,
    recipientEmail: email,
    preheaderText: `Reset your ${APP_NAME} password securely. Link expires in 1 hour.`,
  });

  return sendEmail({ to: email, subject, html });
}

export async function sendParentalConsentEmail(
  parentEmail: string,
  childName: string,
  consentUrl: string,
  locale: string = 'en'
) {
  const trackedConsentUrl = withEmailUtm(consentUrl, 'parental-consent', 'primary-cta');
  const contactUrl = withEmailUtm(`${APP_URL}/contact`, 'parental-consent', 'support-link');

  // Try DB template first
  const dbResult = await renderDbTemplate('parental-consent', {
    childName,
    parentEmail,
    consentUrl: trackedConsentUrl,
  }, parentEmail);

  if (dbResult) {
    return sendEmail({ to: parentEmail, subject: dbResult.subject, html: dbResult.html });
  }

  // Hardcoded fallback
  const subject = 'Parental Consent Required';

  const innerHtml = `
    <!-- Context label -->
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card dark-text">Parental Consent</span>
    </div>

    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#020617;line-height:1.2;letter-spacing:-0.5px;" class="dark-heading mobile-h1">
      Consent Required for ${childName}
    </h1>

    <p style="margin:0 0 28px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      <strong>${childName}</strong> has created an account on ${APP_NAME} and needs your consent to complete registration. Please review the details and provide your approval.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${trackedConsentUrl}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="16%" stroke="f" fillcolor="#1d4ed8">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Review &amp; Provide Consent</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${trackedConsentUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 44px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 14px rgba(29,78,216,0.35);min-width:200px;text-align:center;">
            Review &amp; Provide Consent
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <p style="margin:0 0 28px 0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
      If the button doesn&rsquo;t work, copy and paste this URL:<br>
      <span style="color:#1d4ed8;font-family:'Courier New',monospace;word-break:break-all;">${trackedConsentUrl}</span>
    </p>

    <!-- Info note -->
    <div style="border-left:3px solid #1d4ed8;background:#eff6ff;padding:14px 16px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">
        <strong>&#8505;&#65039; What happens next?</strong><br>
        Once you provide consent, ${childName} will be able to complete their account setup and start using ${APP_NAME}. You&rsquo;ll have access to parental controls and monitoring features.
      </p>
    </div>

    <!-- Help -->
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;" class="dark-border">
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
        Questions about parental consent? <a href="${contactUrl}" style="color:#1d4ed8;text-decoration:none;font-weight:500;">Contact Support</a>
      </p>
    </div>
  `;

  const html = wrapEmailContent(innerHtml, {
    subject,
    recipientEmail: parentEmail,
    preheaderText: `${childName} needs your consent to complete their ${APP_NAME} account registration.`,
  });

  return sendEmail({ to: parentEmail, subject, html });
}

export async function sendWelcomeEmail(email: string, name: string, locale: string = 'en') {
  const dashboardUrl = withEmailUtm(`${APP_URL}/${locale}/dashboard`, 'welcome-email', 'primary-cta');
  const contactUrl = withEmailUtm(`${APP_URL}/contact`, 'welcome-email', 'support-link');

  // Try DB template first
  const dbResult = await renderDbTemplate('welcome-email', {
    name,
    email,
    dashboardUrl,
  }, email);

  if (dbResult) {
    return sendEmail({ to: email, subject: dbResult.subject, html: dbResult.html });
  }

  // Hardcoded fallback
  const subject = `Welcome to ${APP_NAME}!`;

  const innerHtml = `
    <!-- Context label -->
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card dark-text">Account Activated</span>
    </div>

    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#020617;line-height:1.2;letter-spacing:-0.5px;" class="dark-heading mobile-h1">
      Welcome, ${name}!
    </h1>

    <p style="margin:0 0 28px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      Your email has been verified and your ${APP_NAME} account is now active. Start building your portfolio, optimize your profile, and track performance in your dashboard.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${dashboardUrl}" style="height:50px;v-text-anchor:middle;width:220px;" arcsize="16%" stroke="f" fillcolor="#1d4ed8">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Go to Dashboard</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${dashboardUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 44px;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 14px rgba(29,78,216,0.35);min-width:200px;text-align:center;">
            Go to Dashboard
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>

    <!-- Quick Start Guide -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;margin:28px 0;" class="dark-card dark-border">
      <h3 style="margin:0 0 18px 0;font-size:16px;font-weight:700;color:#020617;" class="dark-heading">
        &#128640; Quick Start Guide
      </h3>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:14px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:28px;background:#1d4ed8;border-radius:50%;color:#ffffff;text-align:center;line-height:28px;font-weight:700;font-size:13px;vertical-align:middle;">1</td>
              <td style="padding-left:12px;font-size:15px;color:#475569;vertical-align:middle;" class="dark-text">Complete your profile</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:14px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:28px;background:#1d4ed8;border-radius:50%;color:#ffffff;text-align:center;line-height:28px;font-weight:700;font-size:13px;vertical-align:middle;">2</td>
              <td style="padding-left:12px;font-size:15px;color:#475569;vertical-align:middle;" class="dark-text">Upload your portfolio</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:14px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:28px;background:#1d4ed8;border-radius:50%;color:#ffffff;text-align:center;line-height:28px;font-weight:700;font-size:13px;vertical-align:middle;">3</td>
              <td style="padding-left:12px;font-size:15px;color:#475569;vertical-align:middle;" class="dark-text">Explore opportunities</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:28px;background:#1d4ed8;border-radius:50%;color:#ffffff;text-align:center;line-height:28px;font-weight:700;font-size:13px;vertical-align:middle;">4</td>
              <td style="padding-left:12px;font-size:15px;color:#475569;vertical-align:middle;" class="dark-text">Track performance in your dashboard analytics</td>
            </tr></table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Help -->
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;" class="dark-border">
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;" class="dark-subtle">
        Need help getting started? <a href="${contactUrl}" style="color:#1d4ed8;text-decoration:none;font-weight:500;">Contact Support</a>
      </p>
    </div>
  `;

  const html = wrapEmailContent(innerHtml, {
    subject,
    recipientEmail: email,
    preheaderText: `Welcome to ${APP_NAME}! Your account is now active. Get started with your dashboard.`,
  });

  return sendEmail({ to: email, subject, html });
}

// Notify support/admin when a new ticket is created
export async function sendSupportNotification({ ticket, user }: { ticket: any; user?: { id?: string; email?: string; name?: string } }) {
  const supportTo = process.env.SUPPORT_EMAIL || FROM_EMAIL;

  const vars = {
    ticketId: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    priority: ticket.priority || 'MEDIUM',
    userName: user?.name || 'Unknown',
    userEmail: user?.email || 'Unknown',
    appUrl: withEmailUtm(APP_URL, 'support-ticket-created', 'app-link'),
  } as Record<string, string>;

  const dbResult = await renderDbTemplate('support-ticket-created', vars, supportTo);
  if (dbResult) {
    return sendEmail({ to: supportTo, subject: dbResult.subject, html: dbResult.html });
  }

  const subject = `New support ticket: ${ticket.subject}`;
  const innerHtml = `
    <h2>New support ticket received</h2>
    <p><strong>Ticket ID:</strong> ${ticket.id}</p>
    <p><strong>Subject:</strong> ${ticket.subject}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    <p><strong>From:</strong> ${vars.userName} &lt;${vars.userEmail}&gt;</p>
    <hr />
    <pre style="white-space:pre-wrap">${ticket.message}</pre>
    <p><a href="${withEmailUtm(`${APP_URL}/admin/support`, 'support-ticket-created', 'admin-link')}">Open admin support</a></p>
  `;

  const html = wrapEmailContent(innerHtml, { subject, recipientEmail: supportTo, preheaderText: `New support ticket ${ticket.id}` });
  return sendEmail({ to: supportTo, subject, html });
}

// Send a reply to a user for an existing support ticket
export async function sendTicketReply({ ticket, reply, admin }: { ticket: any; reply: string; admin?: { name?: string; email?: string } }) {
  const recipient = ticket?.user?.email || ticket?.guestEmail;
  if (!recipient) {
    console.warn('sendTicketReply: no recipient for ticket', ticket?.id);
    return { success: false, message: 'No recipient email' };
  }

  const vars: Record<string, string> = {
    ticketId: ticket.id,
    subject: ticket.subject,
    reply: reply,
    adminName: admin?.name || 'Support',
    adminEmail: admin?.email || '',
    appUrl: withEmailUtm(APP_URL, 'support-reply', 'app-link'),
  };

  // Try DB-driven template first
  const dbResult = await renderDbTemplate('support-ticket-reply', vars, recipient);
  if (dbResult) {
    return sendEmail({ to: recipient, subject: dbResult.subject, html: dbResult.html });
  }

  // Fallback HTML (escape reply)
  function escapeHtml(text: string) {
    return text.replace(/[&<>\"'`]/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '\"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    } as Record<string, string>)[c]);
  }

  const subject = `Response to your support ticket: ${ticket.subject}`;
  const safeReply = escapeHtml(reply).replace(/\n/g, '<br/>');

  const innerHtml = `
    <h2>Reply regarding your support ticket</h2>
    <p>Hello ${ticket?.user?.name || ''},</p>
    <p>${admin?.name || 'Support'} has replied to your ticket (#${ticket.id}).</p>
    <div style="border-left:4px solid #e2e8f0;padding:12px;margin:12px 0;background:#f8fafc;">
      ${safeReply}
    </div>
    <p>View your ticket: <a href="${withEmailUtm(`${APP_URL}/support`, 'support-reply', 'ticket-link')}">Open Support Center</a></p>
    <p>If you have further questions, reply to this email.</p>
  `;

  const html = wrapEmailContent(innerHtml, { subject, recipientEmail: recipient, preheaderText: `Reply from 3yeses support on ticket ${ticket.id}` });
  return sendEmail({ to: recipient, subject, html });
}
