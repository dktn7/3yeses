/**
 * 3YESES Email Design System
 * 
 * A premium, consistent wrapper for every transactional email.
 * 
 * Palette:
 *   Primary blue  #1d4ed8
 *   Accent red    #ef4444
 *   Dark navy     #020617
 *   Light BG      #f3f4f6
 * 
 * Features:
 *   - Full HTML document, 600 px max-width, table-based for email clients
 *   - Hidden preheader text
 *   - Top brand bar: logo + tagline + thin accent line
 *   - Content area with generous padding
 *   - Dark navy footer with X / Instagram / TikTok icons, legal links
 *   - prefers-color-scheme dark-mode support
 *   - MSO VML fallbacks for Outlook
 *   - Hosted PNG logo fallback for clients that block SVG/data URIs
 *   - List-Unsubscribe header support
 */

const APP_NAME = '3YESES';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

// ── Social & legal link configuration ──
// Set these env vars in production; defaults are placeholders for dev
const SOCIAL_X_URL = process.env.SOCIAL_X_URL || 'https://x.com/3yeses';
const SOCIAL_IG_URL = process.env.SOCIAL_IG_URL || 'https://instagram.com/3yeses';
const SOCIAL_TT_URL = process.env.SOCIAL_TT_URL || 'https://tiktok.com/@3yeses';
const UNSUBSCRIBE_URL = `${APP_URL}/unsubscribe`;
const PRIVACY_URL = `${APP_URL}/privacy`;
const TERMS_URL = `${APP_URL}/terms`;

// ── Logo ──
// Hosted PNG takes priority (works in Outlook, Yahoo, Gmail).
// Falls back to inline SVG data URI for dev / when no hosted URL is set.
const LOGO_PNG_URL = process.env.EMAIL_LOGO_URL || '';
const LOGO_SVG_DATA = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none'%3E%3Ccircle cx='24' cy='24' r='22' stroke='%231d4ed8' stroke-width='4' fill='transparent'/%3E%3Cpath d='M14 24L20 30L34 16' stroke='%23ef4444' stroke-width='5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E`;
export const LOGO_SVG = LOGO_SVG_DATA; // kept for preview components
const LOGO_SRC = LOGO_PNG_URL || LOGO_SVG_DATA;

// X (Twitter) icon – SVG data URI
const ICON_X = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E`;

// Instagram icon
const ICON_IG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='2' width='20' height='20' rx='5' ry='5'/%3E%3Cpath d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'/%3E%3Cline x1='17.5' y1='6.5' x2='17.51' y2='6.5'/%3E%3C/svg%3E`;

// TikTok icon
const ICON_TT = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.84 2.84 0 0 1 .84.13V9.01a6.27 6.27 0 0 0-1 .05 6.33 6.33 0 0 0-5.27 7.08 6.34 6.34 0 0 0 12.57-1.08V9.49a8.32 8.32 0 0 0 4.84 1.56V7.64a4.85 4.85 0 0 1-1.88-.95z'/%3E%3C/svg%3E`;

/**
 * Returns List-Unsubscribe headers for the Resend API.
 * Call this when building the email send payload.
 */
export function getUnsubscribeHeaders(recipientEmail?: string): Record<string, string> {
  const url = recipientEmail
    ? `${UNSUBSCRIBE_URL}?email=${encodeURIComponent(recipientEmail)}`
    : UNSUBSCRIBE_URL;
  return {
    'List-Unsubscribe': `<${url}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

/**
 * Wraps inner HTML content in the full branded 3YESES email template.
 */
export function wrapEmailContent(innerHtml: string, options?: {
  subject?: string;
  recipientEmail?: string;
  preheaderText?: string;
}): string {
  const subject = options?.subject || '';
  const email = options?.recipientEmail || 'recipient@example.com';
  const preheader = options?.preheaderText || '';
  const year = new Date().getFullYear();
  const unsubUrl = `${UNSUBSCRIBE_URL}?email=${encodeURIComponent(email)}`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>table{border-collapse:collapse;}td{font-family:Arial,sans-serif;}</style>
  <![endif]-->
  <style>
    @media (prefers-color-scheme: dark) {
      .dark-bg   { background-color: #020617 !important; }
      .dark-card  { background-color: #0f172a !important; }
      .dark-text  { color: #e2e8f0 !important; }
      .dark-heading { color: #ffffff !important; }
      .dark-subtle { color: #94a3b8 !important; }
      .dark-border { border-color: #1e293b !important; }
      .dark-blob  { opacity: 0.08 !important; }
    }
    @media only screen and (max-width: 620px) {
      .mobile-full  { width: 100% !important; }
      .mobile-pad   { padding: 24px 20px !important; }
      .mobile-text  { font-size: 14px !important; }
      .mobile-h1    { font-size: 24px !important; }
      .mobile-hide  { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" class="dark-bg">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;" class="dark-bg">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- ============ MAIN CARD ============ -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="mobile-full" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- ── TOP BRAND BAR ── -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 0 40px;position:relative;" class="dark-card mobile-pad">
              <!-- Decorative blobs -->
              <div style="position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,0.12) 0%,transparent 70%);" class="dark-blob"></div>
              <div style="position:absolute;top:30px;right:50px;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,0.10) 0%,transparent 70%);" class="dark-blob"></div>
              <div style="position:absolute;bottom:0;left:-20px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(29,78,216,0.06) 0%,transparent 70%);" class="dark-blob"></div>
              <!-- Logo row -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:14px;">
                          <img src="${LOGO_SRC}" alt="${APP_NAME}" width="40" height="40" style="display:block;border:0;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:24px;font-weight:800;color:#020617;letter-spacing:-0.5px;line-height:1;" class="dark-heading">${APP_NAME}</span>
                        </td>
                        <td style="vertical-align:middle;padding-left:14px;" class="mobile-hide">
                          <span style="font-size:12px;color:#64748b;font-weight:500;letter-spacing:0.3px;" class="dark-subtle">Talent &middot; Casting &middot; Opportunities</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Accent line -->
              <div style="height:3px;border-radius:2px;background:linear-gradient(90deg,#1d4ed8 0%,#ef4444 100%);"></div>
            </td>
          </tr>

          <!-- ── CONTENT AREA ── -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 40px 40px;color:#020617;font-size:16px;line-height:1.7;" class="mobile-pad dark-card dark-text">
              ${innerHtml}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#020617;padding:32px 40px;" class="mobile-pad">
              <!-- Social icons – table-cell layout for reliable inline rendering -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px auto;">
                <tr>
                  <td style="padding:0 6px;"><a href="${SOCIAL_X_URL}" style="text-decoration:none;" title="X"><img src="${ICON_X}" alt="X" width="18" height="18" style="display:inline;border:0;opacity:0.7;" /></a></td>
                  <td style="padding:0 6px;"><a href="${SOCIAL_IG_URL}" style="text-decoration:none;" title="Instagram"><img src="${ICON_IG}" alt="Instagram" width="18" height="18" style="display:inline;border:0;opacity:0.7;" /></a></td>
                  <td style="padding:0 6px;"><a href="${SOCIAL_TT_URL}" style="text-decoration:none;" title="TikTok"><img src="${ICON_TT}" alt="TikTok" width="18" height="18" style="display:inline;border:0;opacity:0.7;" /></a></td>
                </tr>
              </table>
              <!-- Links -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center" style="font-size:12px;">
                    <a href="${PRIVACY_URL}" style="color:#94a3b8;text-decoration:none;padding:0 8px;">Privacy</a>
                    <span style="color:#334155;">&middot;</span>
                    <a href="${TERMS_URL}" style="color:#94a3b8;text-decoration:none;padding:0 8px;">Terms</a>
                    <span style="color:#334155;">&middot;</span>
                    <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:none;padding:0 8px;">Unsubscribe</a>
                    <span style="color:#334155;">&middot;</span>
                    <a href="${APP_URL}" style="color:#94a3b8;text-decoration:none;padding:0 8px;">Visit 3YESES</a>
                  </td>
                </tr>
              </table>
              <p style="color:#475569;margin:0;font-size:11px;text-align:center;line-height:1.6;">
                &copy; ${year} ${APP_NAME}. All rights reserved.<br>
                Sent to <a href="mailto:${email}" style="color:#60a5fa;text-decoration:none;">${email}</a>
              </p>
            </td>
          </tr>
        </table>
        <!-- ============ END CARD ============ -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Returns the HTML for rendering in an iframe preview (same wrapper).
 */
export function getEmailPreviewHtml(innerHtml: string, subject?: string): string {
  return wrapEmailContent(innerHtml, { subject });
}
