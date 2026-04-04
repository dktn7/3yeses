import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
import { wrapEmailContent } from '@/lib/email/emailWrapper';

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, recipients, targetRole, subject, body: emailBody } = body;

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    let emailList: string[] = [];

    if (mode === 'single') {
      if (!recipients || recipients.length === 0) {
        return NextResponse.json({ error: 'At least one recipient required' }, { status: 400 });
      }
      emailList = recipients;
    } else if (mode === 'bulk') {
      const where: Record<string, unknown> = {};
      if (targetRole && targetRole !== 'ALL') {
        where.role = targetRole;
      }
      const users = await prisma.user.findMany({
        where,
        select: { email: true },
      });
      emailList = users.map(u => u.email);
    }

    if (emailList.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Send via Resend if available, otherwise log
    let sentCount = 0;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    if (RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);

      // Send in batches of 10 with rate limiting
      for (let i = 0; i < emailList.length; i += 10) {
        const batch = emailList.slice(i, i + 10);
        const promises = batch.map(email =>
          resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: wrapEmailContent(emailBody, { subject, recipientEmail: email }),
          })
        );
        await Promise.allSettled(promises);
        sentCount += batch.length;

        // Rate limit: wait 1s between batches
        if (i + 10 < emailList.length) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } else {
      console.log(`[DEV] Would send email to ${emailList.length} recipients`);
      console.log(`Subject: ${subject}`);
      sentCount = emailList.length;
    }

    return NextResponse.json({
      success: true,
      message: `Email sent to ${sentCount} recipient${sentCount !== 1 ? 's' : ''}`,
      count: sentCount,
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

export const POST = withAdminAuth(handler);
