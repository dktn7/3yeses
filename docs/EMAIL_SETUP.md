# Email Service Setup Guide

This project uses **Resend** for sending transactional emails.

## 📧 Email Types

The system sends these automated emails:

1. **Email Verification** - After signup (adult/parent accounts)
2. **Parental Consent** - For teen accounts (13-15 years)
3. **Password Reset** - Forgot password flow
4. **Welcome Email** - After email verification

---

## 🚀 Quick Setup (Development)

### Option 1: Console Logging (No Setup Required)

By default, if `RESEND_API_KEY` is not set, emails will be logged to the console. This is perfect for local development.

```bash
# Just run your app - no email config needed!
npm run dev
```

### Option 2: Resend (Recommended for Testing)

1. **Sign up for Resend** (Free - 3,000 emails/month)
   - Go to: https://resend.com/signup
   - No credit card required

2. **Get your API key**
   - After signup, go to API Keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Add to your `.env.local`**
   ```bash
   RESEND_API_KEY="re_your_actual_api_key_here"
   EMAIL_FROM="onboarding@resend.dev"  # Use this for testing
   ```

4. **Restart your dev server**
   ```bash
   npm run dev
   ```

That's it! Emails will now be sent via Resend.

---

## 🎨 Email Templates

All email templates are located in `lib/email/emailService.ts` with beautiful HTML designs:

- ✅ **Responsive design** (mobile-friendly)
- ✅ **Dark mode compatible**
- ✅ **Gradient headers**
- ✅ **Clear CTAs** (call-to-action buttons)
- ✅ **Security notices**

### Preview Emails

To preview emails during development, check your console logs:
```
✅ Email sent successfully: { to, subject, messageId }
```

Or set `RESEND_API_KEY` to see actual sent emails in Resend dashboard.

---

## 📝 Production Setup

### Step 1: Domain Verification (Optional but Recommended)

To send emails from your own domain (e.g., `noreply@3yeses.online`):

1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter your domain: `3yeses.online`
4. Add the DNS records to your domain provider:
   - SPF record
   - DKIM record
   - DMARC record (optional)
5. Wait for verification (~10 minutes)

### Step 2: Update Environment Variables

```bash
# Production .env
RESEND_API_KEY="re_your_production_key"
EMAIL_FROM="noreply@3yeses.online"  # Your verified domain
NEXT_PUBLIC_APP_URL="https://3yeses.online"
```

### Step 3: Test Email Sending

Create a test route to send a test email:

```typescript
// app/api/test-email/route.ts
import { sendWelcomeEmail } from '@/lib/email/emailService';

export async function GET() {
  await sendWelcomeEmail('test@example.com', 'Test User', 'en');
  return Response.json({ success: true });
}
```

Visit: `https://yourdomain.com/api/test-email`

---

## 🔧 Alternative Email Services

If you prefer a different service, you can easily swap out Resend:

### SendGrid

```bash
npm install @sendgrid/mail
```

Update `lib/email/emailService.ts`:
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html }: EmailOptions) {
  await sgMail.send({ from: FROM_EMAIL, to, subject, html });
}
```

### AWS SES

```bash
npm install @aws-sdk/client-ses
```

### Nodemailer (Gmail, etc.)

```bash
npm install nodemailer
```

---

## 📊 Email Monitoring

### Resend Dashboard

- View sent emails
- Check delivery status
- Monitor bounce rates
- See open/click rates (if tracking enabled)

### Console Logs

All email operations are logged:
```
✅ Email sent successfully: user@example.com
❌ Failed to send email: error details
```

---

## 🛡️ Security Best Practices

1. **Never commit API keys** - Use `.env.local` (already in `.gitignore`)
2. **Rate limiting** - Resend has built-in rate limits
3. **Token expiration** - All email tokens expire (1 hour for reset, 24 hours for verification)
4. **Email enumeration prevention** - Always return success message

---

## 🧪 Testing Emails

### Manual Testing

1. Sign up for an account
2. Check console logs for email content
3. Copy verification/reset links from logs
4. Test the full flow

### Automated Testing (Future)

Consider using:
- **Mailtrap** - Email testing sandbox
- **Ethereal Email** - Fake SMTP service for testing

---

## 💰 Pricing

### Resend Free Tier
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ 1 custom domain
- ✅ All features included

### Resend Paid Plans
- **Pro**: $20/month - 50,000 emails
- **Business**: Custom pricing

For most startups, the free tier is sufficient!

---

## 🐛 Troubleshooting

### Emails not sending?

1. Check `RESEND_API_KEY` is set in `.env.local`
2. Restart your dev server
3. Check console for error messages
4. Verify domain is configured (for production)

### Emails going to spam?

1. Verify your domain with SPF/DKIM records
2. Use a professional "from" address
3. Avoid spam trigger words in subject
4. Warm up your sending domain gradually

### Links not working?

1. Check `NEXT_PUBLIC_APP_URL` is correct
2. Ensure it includes protocol (`http://` or `https://`)
3. No trailing slash

---

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend React Email](https://react.email/) - Advanced templates
- [Email Best Practices](https://resend.com/docs/knowledge-base/best-practices)

---

## 🎯 Next Steps

1. Sign up for Resend (free)
2. Get API key
3. Add to `.env.local`
4. Test signup flow
5. Verify emails are sent
6. Configure custom domain (production)

Happy emailing! 📧✨
