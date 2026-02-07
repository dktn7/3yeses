/**
 * Email Service Test
 * 
 * This file demonstrates how to test the email service.
 * Run this as a standalone API endpoint to test email sending.
 */

import { NextResponse } from 'next/server';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendParentalConsentEmail,
  sendWelcomeEmail,
} from '@/lib/email/emailService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  const email = searchParams.get('email') || 'test@example.com';

  const results: any = {
    timestamp: new Date().toISOString(),
    email,
    resendConfigured: !!process.env.RESEND_API_KEY,
    tests: [],
  };

  try {
    // Test 1: Verification Email
    if (type === 'all' || type === 'verification') {
      try {
        await sendVerificationEmail(email, 'test-token-123', 'en');
        results.tests.push({
          name: 'Verification Email',
          status: 'success',
          message: '✅ Verification email sent',
        });
      } catch (error) {
        results.tests.push({
          name: 'Verification Email',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Test 2: Password Reset Email
    if (type === 'all' || type === 'reset') {
      try {
        await sendPasswordResetEmail(email, 'test-reset-token-456', 'en');
        results.tests.push({
          name: 'Password Reset Email',
          status: 'success',
          message: '✅ Password reset email sent',
        });
      } catch (error) {
        results.tests.push({
          name: 'Password Reset Email',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Test 3: Parental Consent Email
    if (type === 'all' || type === 'consent') {
      try {
        const consentUrl = `http://localhost:3002/auth/parental-consent/test-consent-789`;
        await sendParentalConsentEmail(email, 'John Doe', consentUrl, 'en');
        results.tests.push({
          name: 'Parental Consent Email',
          status: 'success',
          message: '✅ Parental consent email sent',
        });
      } catch (error) {
        results.tests.push({
          name: 'Parental Consent Email',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Test 4: Welcome Email
    if (type === 'all' || type === 'welcome') {
      try {
        await sendWelcomeEmail(email, 'Test User', 'en');
        results.tests.push({
          name: 'Welcome Email',
          status: 'success',
          message: '✅ Welcome email sent',
        });
      } catch (error) {
        results.tests.push({
          name: 'Welcome Email',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      note: !process.env.RESEND_API_KEY
        ? '⚠️  RESEND_API_KEY not configured. Check console logs for email content.'
        : '✅ RESEND_API_KEY configured. Emails sent via Resend.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...results,
      },
      { status: 500 }
    );
  }
}

/**
 * USAGE EXAMPLES:
 * 
 * Test all emails:
 * GET /api/test-email
 * 
 * Test specific email type:
 * GET /api/test-email?type=verification
 * GET /api/test-email?type=reset
 * GET /api/test-email?type=consent
 * GET /api/test-email?type=welcome
 * 
 * Test with custom email:
 * GET /api/test-email?email=your@email.com
 * 
 * Test specific type with custom email:
 * GET /api/test-email?type=verification&email=your@email.com
 */
