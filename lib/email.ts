/**
 * Email Service for 3YESES Platform
 * 
 * This module handles all email sending functionality.
 * Currently using console logging for development.
 * 
 * TODO: Integrate with a real email service provider:
 * - Resend (recommended): https://resend.com
 * - SendGrid: https://sendgrid.com
 * - Nodemailer with SMTP
 */

import { wrapEmailContent } from '@/lib/email/emailWrapper';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 * @param options Email options (to, subject, html, text)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // TODO: Replace with actual email service
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@3yeses.online',
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    // });
    
    // Development mode: Log email to console
    console.log('\n📧 ========== EMAIL ==========');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('HTML Content:');
    console.log(options.html);
    console.log('============================\n');
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

/**
 * Send parental consent verification email
 * @param parentEmail Parent's email address
 * @param parentName Parent's name
 * @param teenName Teen's name
 * @param teenAge Teen's age
 * @param consentToken Verification token
 */
export async function sendParentalConsentEmail(
  parentEmail: string,
  parentName: string,
  teenName: string,
  teenAge: number,
  consentToken: string
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const approveUrl = `${baseUrl}/auth/parental-consent/${consentToken}?action=approve`;
  const declineUrl = `${baseUrl}/auth/parental-consent/${consentToken}?action=decline`;
  
  const subject = `Parental Consent Required: ${teenName} wants to join 3YESES`;
  const innerHtml = `
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card dark-text">Parental Consent</span>
    </div>

    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#020617;line-height:1.2;letter-spacing:-0.5px;" class="dark-heading mobile-h1">
      Consent Required for ${teenName}
    </h1>

    <p style="margin:0 0 16px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      Dear ${parentName},
    </p>

    <p style="margin:0 0 16px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      <strong>${teenName}</strong> (age ${teenAge}) has requested a self-managed 3YESES account. As they are under 16, we need your consent before activation.
    </p>

    <div style="border-left:3px solid #1d4ed8;background:#eff6ff;padding:14px 16px;border-radius:0 6px 6px 0;margin:24px 0;">
      <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#1e3a8a;" class="dark-heading">What this enables</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;color:#1e3a8a;line-height:1.7;" class="dark-text">
        <li>${teenName} can manage their profile and portfolio</li>
        <li>Enhanced safety controls remain active</li>
        <li>You can request account monitoring access at any time</li>
      </ul>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 12px 0;">
      <tr>
        <td align="center" style="padding-bottom:12px;">
          <a href="${approveUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;min-width:220px;text-align:center;">Approve Account</a>
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href="${declineUrl}" style="display:inline-block;background:#B91C1C;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;min-width:220px;text-align:center;">Decline Account</a>
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0 0;font-size:13px;color:#64748b;line-height:1.7;" class="dark-subtle">
      This consent link expires in 48 hours. If no action is taken, the account will stay pending.
    </p>

    <p style="margin:12px 0 0 0;font-size:13px;color:#64748b;line-height:1.7;" class="dark-subtle">
      Need help? Contact <a href="mailto:support@3yeses.online" style="color:#1d4ed8;text-decoration:none;">support@3yeses.online</a>
    </p>
  `;

  const html = wrapEmailContent(innerHtml, {
    subject,
    recipientEmail: parentEmail,
    preheaderText: `${teenName} needs your consent to activate their 3YESES account.`,
  });
  
  const text = `
Parental Consent Required

Dear ${parentName},

Your child, ${teenName} (age ${teenAge}), has requested to create a self-managed account on 3YESES, our talent platform.

As they are under 16 years old, we require your consent before their account can become active.

To approve this account, visit: ${approveUrl}
To decline this account, visit: ${declineUrl}

This consent link will expire in 48 hours.

If you have any questions, please contact support@3yeses.online

© ${new Date().getFullYear()} 3YESES
  `;
  
  return await sendEmail({
    to: parentEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send parental consent approved notification to teen
 * @param teenEmail Teen's email address
 * @param teenName Teen's name
 */
export async function sendConsentApprovedEmail(
  teenEmail: string,
  teenName: string
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const loginUrl = `${baseUrl}/auth/signin`;
  
  const subject = 'Your account has been approved!';
  const innerHtml = `
    <div style="margin-bottom:8px;">
      <span style="display:inline-block;background:#f0fdf4;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:100px;" class="dark-card dark-text">Account Approved</span>
    </div>

    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#020617;line-height:1.2;letter-spacing:-0.5px;" class="dark-heading mobile-h1">
      Great news, ${teenName}
    </h1>

    <p style="margin:0 0 24px 0;font-size:16px;color:#475569;line-height:1.7;" class="dark-text mobile-text">
      Your parent or guardian approved your 3YESES account. You can now sign in, build your profile, and start exploring opportunities.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${loginUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:600;min-width:220px;text-align:center;">Sign In Now</a>
        </td>
      </tr>
    </table>
  `;

  const html = wrapEmailContent(innerHtml, {
    subject,
    recipientEmail: teenEmail,
    preheaderText: 'Your 3YESES account is approved and ready to use.',
  });
  
  return await sendEmail({
    to: teenEmail,
    subject,
    html,
    text: `Hi ${teenName}, Your parent/guardian has approved your 3YESES account! Sign in at ${loginUrl}`,
  });
}
