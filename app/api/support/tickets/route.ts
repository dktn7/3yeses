import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';
import { sendSupportNotification } from '@/lib/email/emailService';

const CreateTicketSchema = z.object({
  subject: z.string().min(3),
  message: z.string().min(10),
  category: z.enum(['ACCOUNT', 'BILLING', 'PORTFOLIO', 'CATEGORIES', 'NOTIFICATIONS', 'SECURITY', 'OTHER']).optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const parse = CreateTicketSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid body', details: parse.error.format() }, { status: 400 });
    }

    const { subject, message, category = 'OTHER', tags = [] } = parse.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        category,
        tags,
        userId: decoded.userId,
      },
    });

    // Notify support/admin via existing email service (best-effort)
    try {
      await sendSupportNotification({ ticket, user: { id: decoded.userId, email: decoded.email, name: decoded.name } });
    } catch (e) {
      console.error('Support notification failed:', e);
    }

    return NextResponse.json({ success: true, ticketId: ticket.id }, { status: 201 });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('List support tickets error:', error);
    return NextResponse.json({ error: 'Failed to list tickets' }, { status: 500 });
  }
}
