import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';
import { sendTicketReply } from '@/lib/email/emailService';

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  try {
    // Load existing ticket first
    // @ts-ignore
    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } }, assignedTo: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, priority, assignedToId, internalNotes, reply } = body;

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId; // Allow unassigning with null

    // Preserve or append internal notes
    if (internalNotes) {
      data.internalNotes = internalNotes;
    }

    // If 'reply' present, send email to ticket owner (best-effort) and append to internalNotes
    if (reply) {
      try {
        const adminUser = (authResult as any).user;
        // Append reply to internalNotes with timestamp and admin info
        const stamp = new Date().toISOString();
        const header = `Reply from ${adminUser?.name || 'Admin'} <${adminUser?.email || 'noreply'}> at ${stamp}`;
        const block = `${header}\n${reply}\n---`;

        const previous = existing.internalNotes || '';
        data.internalNotes = previous ? `${previous}\n\n${block}` : block;

        // Send reply email (best-effort)
        try {
          await sendTicketReply({ ticket: existing, reply, admin: { name: adminUser?.name, email: adminUser?.email } });
        } catch (e) {
          console.error('Failed to send ticket reply email:', e);
        }
        // Create structured message record for this reply
        try {
          // @ts-ignore
          await prisma.supportTicketMessage.create({
            data: {
              ticketId: id,
              content: reply,
              isStaff: true,
              authorId: adminUser?.userId || undefined,
            },
          });
        } catch (e) {
          console.error('Failed to create support ticket message:', e);
        }
      } catch (e) {
        console.error('Error handling reply:', e);
      }
    }

    // @ts-ignore
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, name: true, email: true } } } },
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { id } = await context.params;

  try {
    // @ts-ignore
    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
