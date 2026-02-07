import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use Resend's verified testing domain by default
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_NAME = '3YesEs';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

// Rate limiting: Track last email send time
let lastEmailTime = 0;
const MIN_EMAIL_INTERVAL = 500; // 500ms = 2 emails per second max

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
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

export async function sendVerificationEmail(email: string, token: string, locale: string = 'en') {
  const verificationUrl = `${APP_URL}/${locale}/auth/verify-email?token=${token}`;
  
  const subject = 'Verify Your Email Address';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${subject}</title>
        <!--[if mso]>
        <style>
          table {border-collapse: collapse;}
        </style>
        <![endif]-->
        <style>
          @media (prefers-color-scheme: dark) {
            .dark-mode-bg { background-color: #1a1a1a !important; }
            .dark-mode-text { color: #e5e7eb !important; }
            .dark-mode-heading { color: #ffffff !important; }
            .dark-mode-card { background-color: #2d2d2d !important; }
            .dark-mode-subtle { color: #9ca3af !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 20px !important; }
            .mobile-text { font-size: 14px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;" class="dark-mode-bg">
        <!-- Preheader Text (hidden in email, visible in inbox preview) -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
          Welcome to ${APP_NAME}! Please verify your email address to get started.
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 20px;" class="dark-mode-bg">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); max-width: 600px;" class="dark-mode-card">
                
                <!-- Logo/Brand Header with Icon -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff;" class="mobile-padding dark-mode-card">
                    <!-- Icon/Logo Placeholder -->
                    <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; margin-bottom: 16px; line-height: 64px; font-size: 32px;">
                      ✓
                    </div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;" class="dark-mode-heading">${APP_NAME}</h1>
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin: 16px auto 0; border-radius: 2px;"></div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;" class="mobile-padding">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3;" class="dark-mode-heading">
                      Verify Your Email
                    </h2>
                    
                    <p style="color: #4a5568; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;" class="dark-mode-text mobile-text">
                      Welcome! To get started with ${APP_NAME}, please verify your email address by clicking the button below.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" stroke="f" fillcolor="#667eea">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Verify Email Address</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); min-width: 200px; text-align: center;">
                            Verify Email Address
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 32px;" class="dark-mode-card">
                      <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; font-weight: 500;" class="dark-mode-subtle">
                        Or copy this link:
                      </p>
                      <p style="color: #667eea; margin: 0; font-size: 13px; word-break: break-all; font-family: 'Courier New', monospace;">
                        ${verificationUrl}
                      </p>
                    </div>
                    
                    <!-- Security Note -->
                    <div style="border-left: 3px solid #fbbf24; background-color: #fffbeb; padding: 16px; margin-top: 32px; border-radius: 4px;">
                      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;" class="mobile-text">
                        <strong>⏱ Expires in 24 hours</strong><br>
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; text-align: center;" class="dark-mode-subtle mobile-text">
                        Need help? <a href="${APP_URL}/contact" style="color: #667eea; text-decoration: none;">Contact Support</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer with Social Links -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;" class="mobile-padding dark-mode-card">
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="center">
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'/%3E%3C/svg%3E" alt="Twitter" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'/%3E%3Ccircle cx='4' cy='4' r='2'/%3E%3C/svg%3E" alt="LinkedIn" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' x='2' y='2' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01'/%3E%3C/svg%3E" alt="Instagram" width="24" height="24" style="display: block;">
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.5;" class="dark-mode-subtle">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                      This email was sent to <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                    </p>
                    
                    <p style="color: #9ca3af; margin: 16px 0 0 0; font-size: 11px; text-align: center;" class="dark-mode-subtle">
                      <a href="${APP_URL}/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="${APP_URL}/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string = 'en') {
  const resetUrl = `${APP_URL}/${locale}/auth/reset-password?token=${token}`;
  
  const subject = 'Reset Your Password';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${subject}</title>
        <style>
          @media (prefers-color-scheme: dark) {
            .dark-mode-bg { background-color: #1a1a1a !important; }
            .dark-mode-text { color: #e5e7eb !important; }
            .dark-mode-heading { color: #ffffff !important; }
            .dark-mode-card { background-color: #2d2d2d !important; }
            .dark-mode-subtle { color: #9ca3af !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 20px !important; }
            .mobile-text { font-size: 14px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;" class="dark-mode-bg">
        <!-- Preheader Text -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
          Reset your ${APP_NAME} password securely. Link expires in 1 hour.
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 20px;" class="dark-mode-bg">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); max-width: 600px;" class="dark-mode-card">
                
                <!-- Logo/Brand Header with Icon -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff;" class="mobile-padding dark-mode-card">
                    <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); border-radius: 16px; margin-bottom: 16px; line-height: 64px; font-size: 32px;">
                      🔒
                    </div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;" class="dark-mode-heading">${APP_NAME}</h1>
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #ec4899 0%, #ef4444 100%); margin: 16px auto 0; border-radius: 2px;"></div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;" class="mobile-padding">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3;" class="dark-mode-heading">
                      Reset Your Password
                    </h2>
                    
                    <p style="color: #4a5568; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;" class="dark-mode-text mobile-text">
                      We received a request to reset your password for ${APP_NAME}. Click the button below to create a new password.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="#ec4899">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Reset Password</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4); min-width: 200px; text-align: center;">
                            Reset Password
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 32px;" class="dark-mode-card">
                      <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; font-weight: 500;" class="dark-mode-subtle">
                        Or copy this link:
                      </p>
                      <p style="color: #ec4899; margin: 0; font-size: 13px; word-break: break-all; font-family: 'Courier New', monospace;">
                        ${resetUrl}
                      </p>
                    </div>
                    
                    <!-- Security Warning -->
                    <div style="border-left: 3px solid #ef4444; background-color: #fef2f2; padding: 16px; margin-top: 32px; border-radius: 4px;">
                      <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.5;" class="mobile-text">
                        <strong>🔒 Security Notice</strong><br>
                        This link expires in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                      </p>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; text-align: center;" class="dark-mode-subtle mobile-text">
                        Having trouble? <a href="${APP_URL}/contact" style="color: #ec4899; text-decoration: none;">Contact Support</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer with Social Links -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;" class="mobile-padding dark-mode-card">
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="center">
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'/%3E%3C/svg%3E" alt="Twitter" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'/%3E%3Ccircle cx='4' cy='4' r='2'/%3E%3C/svg%3E" alt="LinkedIn" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' x='2' y='2' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01'/%3E%3C/svg%3E" alt="Instagram" width="24" height="24" style="display: block;">
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.5;" class="dark-mode-subtle">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                      This email was sent to <a href="mailto:${email}" style="color: #ec4899; text-decoration: none;">${email}</a>
                    </p>
                    
                    <p style="color: #9ca3af; margin: 16px 0 0 0; font-size: 11px; text-align: center;" class="dark-mode-subtle">
                      <a href="${APP_URL}/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="${APP_URL}/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendParentalConsentEmail(
  parentEmail: string,
  childName: string,
  consentUrl: string,
  locale: string = 'en'
) {
  const subject = 'Parental Consent Required';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${subject}</title>
        <style>
          @media (prefers-color-scheme: dark) {
            .dark-mode-bg { background-color: #1a1a1a !important; }
            .dark-mode-text { color: #e5e7eb !important; }
            .dark-mode-heading { color: #ffffff !important; }
            .dark-mode-card { background-color: #2d2d2d !important; }
            .dark-mode-subtle { color: #9ca3af !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 20px !important; }
            .mobile-text { font-size: 14px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;" class="dark-mode-bg">
        <!-- Preheader Text -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
          ${childName} needs your consent to complete their ${APP_NAME} account registration.
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 20px;" class="dark-mode-bg">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); max-width: 600px;" class="dark-mode-card">
                
                <!-- Logo/Brand Header with Icon -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff;" class="mobile-padding dark-mode-card">
                    <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); border-radius: 16px; margin-bottom: 16px; line-height: 64px; font-size: 32px;">
                      👪
                    </div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;" class="dark-mode-heading">${APP_NAME}</h1>
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%); margin: 16px auto 0; border-radius: 2px;"></div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;" class="mobile-padding">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3;" class="dark-mode-heading">
                      Parental Consent Required
                    </h2>
                    
                    <p style="color: #4a5568; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;" class="dark-mode-text mobile-text">
                      <strong>${childName}</strong> has created an account on ${APP_NAME} and needs your consent to complete the registration process.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${consentUrl}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="16%" stroke="f" fillcolor="#3b82f6">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Review & Provide Consent</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${consentUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); min-width: 200px; text-align: center;">
                            Review & Provide Consent
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 32px;" class="dark-mode-card">
                      <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px; font-weight: 500;" class="dark-mode-subtle">
                        Or copy this link:
                      </p>
                      <p style="color: #3b82f6; margin: 0; font-size: 13px; word-break: break-all; font-family: 'Courier New', monospace;">
                        ${consentUrl}
                      </p>
                    </div>
                    
                    <!-- Info Box -->
                    <div style="border-left: 3px solid #3b82f6; background-color: #eff6ff; padding: 16px; margin-top: 32px; border-radius: 4px;">
                      <p style="color: #1e3a8a; margin: 0; font-size: 14px; line-height: 1.5;" class="mobile-text">
                        <strong>ℹ️ What happens next?</strong><br>
                        Once you provide consent, ${childName} will be able to complete their account setup and start using ${APP_NAME}. You'll have access to parental controls and monitoring features.
                      </p>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; text-align: center;" class="dark-mode-subtle mobile-text">
                        Questions about parental consent? <a href="${APP_URL}/contact" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer with Social Links -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;" class="mobile-padding dark-mode-card">
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="center">
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'/%3E%3C/svg%3E" alt="Twitter" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'/%3E%3Ccircle cx='4' cy='4' r='2'/%3E%3C/svg%3E" alt="LinkedIn" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' x='2' y='2' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01'/%3E%3C/svg%3E" alt="Instagram" width="24" height="24" style="display: block;">
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.5;" class="dark-mode-subtle">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                      This email was sent to <a href="mailto:${parentEmail}" style="color: #3b82f6; text-decoration: none;">${parentEmail}</a>
                    </p>
                    
                    <p style="color: #9ca3af; margin: 16px 0 0 0; font-size: 11px; text-align: center;" class="dark-mode-subtle">
                      <a href="${APP_URL}/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="${APP_URL}/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to: parentEmail, subject, html });
}

export async function sendWelcomeEmail(email: string, name: string, locale: string = 'en') {
  const dashboardUrl = `${APP_URL}/${locale}/dashboard`;
  
  const subject = `Welcome to ${APP_NAME}!`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${subject}</title>
        <style>
          @media (prefers-color-scheme: dark) {
            .dark-mode-bg { background-color: #1a1a1a !important; }
            .dark-mode-text { color: #e5e7eb !important; }
            .dark-mode-heading { color: #ffffff !important; }
            .dark-mode-card { background-color: #2d2d2d !important; }
            .dark-mode-subtle { color: #9ca3af !important; }
          }
          @media only screen and (max-width: 600px) {
            .mobile-padding { padding: 20px !important; }
            .mobile-text { font-size: 14px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;" class="dark-mode-bg">
        <!-- Preheader Text -->
        <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
          Welcome to ${APP_NAME}! Your account is now active. Get started with your dashboard.
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 20px;" class="dark-mode-bg">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); max-width: 600px;" class="dark-mode-card">
                
                <!-- Logo/Brand Header with Icon -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #ffffff;" class="mobile-padding dark-mode-card">
                    <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; margin-bottom: 16px; line-height: 64px; font-size: 32px;">
                      🎉
                    </div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px;" class="dark-mode-heading">${APP_NAME}</h1>
                    <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin: 16px auto 0; border-radius: 2px;"></div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;" class="mobile-padding">
                    <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px; font-weight: 600; line-height: 1.3;" class="dark-mode-heading">
                      Welcome, ${name}! 🎉
                    </h2>
                    
                    <p style="color: #4a5568; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;" class="dark-mode-text mobile-text">
                      Your email has been verified and your account is now active! We're excited to have you join the ${APP_NAME} community. Get started by exploring your dashboard.
                    </p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${dashboardUrl}" style="height:50px;v-text-anchor:middle;width:200px;" arcsize="16%" stroke="f" fillcolor="#667eea">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">Go to Dashboard</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); min-width: 200px; text-align: center;">
                            Go to Dashboard
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Quick Start Guide -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-top: 32px;" class="dark-mode-card">
                      <h3 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;" class="dark-mode-heading">
                        🚀 Quick Start Guide
                      </h3>
                      
                      <div style="margin-bottom: 16px;">
                        <div style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; margin-right: 12px; vertical-align: middle;">1</div>
                        <span style="color: #4a5568; font-size: 15px; vertical-align: middle;" class="dark-mode-text">Complete your profile</span>
                      </div>
                      
                      <div style="margin-bottom: 16px;">
                        <div style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; margin-right: 12px; vertical-align: middle;">2</div>
                        <span style="color: #4a5568; font-size: 15px; vertical-align: middle;" class="dark-mode-text">Upload your portfolio</span>
                      </div>
                      
                      <div style="margin-bottom: 16px;">
                        <div style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; margin-right: 12px; vertical-align: middle;">3</div>
                        <span style="color: #4a5568; font-size: 15px; vertical-align: middle;" class="dark-mode-text">Explore opportunities</span>
                      </div>
                      
                      <div>
                        <div style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; color: #ffffff; text-align: center; line-height: 28px; font-weight: 600; font-size: 14px; margin-right: 12px; vertical-align: middle;">4</div>
                        <span style="color: #4a5568; font-size: 15px; vertical-align: middle;" class="dark-mode-text">Connect with the community</span>
                      </div>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; text-align: center;" class="dark-mode-subtle mobile-text">
                        Need help getting started? <a href="${APP_URL}/contact" style="color: #667eea; text-decoration: none;">Contact Support</a>
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer with Social Links -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;" class="mobile-padding dark-mode-card">
                    <!-- Social Links -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td align="center">
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z'/%3E%3C/svg%3E" alt="Twitter" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z'/%3E%3Ccircle cx='4' cy='4' r='2'/%3E%3C/svg%3E" alt="LinkedIn" width="24" height="24" style="display: block;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px;">
                            <img src="data:image/svg+xml,%3Csvg width='24' height='24' fill='%239ca3af' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' x='2' y='2' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01'/%3E%3C/svg%3E" alt="Instagram" width="24" height="24" style="display: block;">
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center; line-height: 1.5;" class="dark-mode-subtle">
                      © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
                      This email was sent to <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                    </p>
                    
                    <p style="color: #9ca3af; margin: 16px 0 0 0; font-size: 11px; text-align: center;" class="dark-mode-subtle">
                      <a href="${APP_URL}/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="${APP_URL}/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
