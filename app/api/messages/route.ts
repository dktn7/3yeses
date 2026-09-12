import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth/auth-service';
import { sendSupportNotification } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';

const CreateSupportConversationSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  category: z.enum(['ACCOUNT', 'BILLING', 'PORTFOLIO', 'CATEGORIES', 'NOTIFICATIONS', 'SECURITY', 'OTHER']).optional(),
});

const ReplySchema = z.object({
  ticketId: z.string().trim().min(1),
  message: z.string().trim().min(1).max(4000),
});

async function requireUser(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) return null;
  return AuthService.verifyJWT(accessToken);
}

function formatAnnouncement(alert: {
  id: string;
  title: string;
  message: string;
  type: string;
  expiresAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: alert.id,
    title: alert.title,
    message: alert.message,
    type: alert.type,
    expiresAt: alert.expiresAt,
    createdAt: alert.createdAt,
  };
}

function formatTicketConversation(ticket: any) {
  const timeline = [
    {
      id: `ticket-${ticket.id}-initial`,
      content: ticket.message,
      isStaff: false,
      author: ticket.user ? { id: ticket.user.id, name: ticket.user.name, email: ticket.user.email } : null,
      createdAt: ticket.createdAt,
    },
    ...ticket.messages.map((message: any) => ({
      id: message.id,
      content: message.content,
      isStaff: message.isStaff,
      author: message.author ? { id: message.author.id, name: message.author.name, email: message.author.email } : null,
      createdAt: message.createdAt,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const lastMessage = timeline[timeline.length - 1] || null;

  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastMessage,
    messages: timeline,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const now = new Date();
    const [announcements, tickets] = await Promise.all([
      prisma.globalNotification.findMany({
        where: {
          active: true,
          OR: [{ targetRole: null }, { targetRole: user.role as any }],
          AND: [
            {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } },
              ],
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.supportTicket.findMany({
        where: { userId: user.userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, name: true, email: true } } },
          },
        },
      }),
    ]);

    const conversations = tickets.map(formatTicketConversation);
    const openCount = conversations.filter((ticket) => !['RESOLVED', 'CLOSED'].includes(ticket.status)).length;

    return NextResponse.json({
      success: true,
      announcements: announcements.map(formatAnnouncement),
      conversations,
      counts: {
        announcements: announcements.length,
        conversations: conversations.length,
        open: openCount,
      },
    });
  } catch (error) {
    console.error('Messages inbox error:', error);
    return NextResponse.json({ success: false, message: 'Failed to load messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    if (typeof body.ticketId === 'string' && body.ticketId.trim()) {
      const parsed = ReplySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid reply', details: parsed.error.format() }, { status: 400 });
      }

      const ticket = await prisma.supportTicket.findFirst({
        where: { id: parsed.data.ticketId, userId: user.userId },
        select: { id: true, status: true },
      });

      if (!ticket) {
        return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 });
      }

      if (ticket.status === 'CLOSED') {
        return NextResponse.json({ success: false, message: 'This support conversation is closed' }, { status: 409 });
      }

      await prisma.$transaction([
        prisma.supportTicketMessage.create({
          data: {
            ticketId: parsed.data.ticketId,
            authorId: user.userId,
            content: parsed.data.message,
            isStaff: false,
          },
        }),
        prisma.supportTicket.update({
          where: { id: parsed.data.ticketId },
          data: {
            status: ticket.status === 'WAITING_FOR_USER' ? 'OPEN' : ticket.status,
          },
        }),
      ]);

      return NextResponse.json({ success: true }, { status: 201 });
    }

    const parsed = CreateSupportConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid support message', details: parsed.error.format() }, { status: 400 });
    }

    const { subject, message, category = 'OTHER' } = parsed.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        category,
        tags: ['dashboard-message'],
        userId: user.userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    try {
      await sendSupportNotification({ ticket, user: { id: user.userId, email: user.email, name: user.name } });
    } catch (error) {
      console.error('Support notification failed:', error);
    }

    return NextResponse.json({ success: true, conversation: formatTicketConversation({ ...ticket, messages: [] }) }, { status: 201 });
  } catch (error) {
    console.error('Messages send error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}
