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
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parental Consent Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333EA 0%, #3B82F6 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">3YESES</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Talent Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Parental Consent Required</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Dear ${parentName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Your child, <strong>${teenName}</strong> (age ${teenAge}), has requested to create a self-managed account on 3YESES, our talent platform.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                As they are under 16 years old, we require your consent before their account can become active. They will have their own login credentials and will manage their profile directly, but we want to ensure you're aware and approve of this.
              </p>
              
              <div style="background-color: #eff6ff; border-left: 4px solid: #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 18px;">What does this mean?</h3>
                <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                    <li>${teenName} will be able to create and manage their own talent profile</li>
                  <li>They can apply for opportunities and showcase their skills</li>
                  <li>Their profile will have enhanced safety controls</li>
                  <li>You can request access to monitor the account at any time</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                <strong>Please choose one of the following options:</strong>
              </p>
              
              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" style="padding: 0 0 12px 0;">
                    <a href="${approveUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      ✓ Approve Account
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${declineUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      ✗ Decline Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <strong>Important:</strong> This consent link will expire in 48 hours. If you don't respond, the account will remain pending until you approve or decline.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0;">
                If you have any questions or concerns, please contact our support team at <a href="mailto:support@3yeses.online" style="color: #3b82f6;">support@3yeses.online</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} 3YESES. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                This email was sent to ${parentEmail} because your child requested to create an account.
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
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">🎉 Account Approved!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="color: #4b5563; font-size: 16px;">Hi ${teenName},</p>
              <p style="color: #4b5563; font-size: 16px;">Great news! Your parent/guardian has approved your 3YESES account. You can now start building your talent profile and exploring opportunities!</p>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  Sign In Now
                </a>
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
  
  return await sendEmail({
    to: teenEmail,
    subject,
    html,
    text: `Hi ${teenName}, Your parent/guardian has approved your 3YESES account! Sign in at ${loginUrl}`,
  });
}
