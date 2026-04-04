import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status, priority, assignedToId, internalNotes, reply } = body;

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId; // Allow unassigning with null
    if (internalNotes) data.internalNotes = internalNotes;

    // If 'reply' is present, we would typically send an email here.
    
    if (reply) {
      // TODO: Integrate with Resend to email the user
      console.log(`[MOCK EMAIL] Sending reply to ticket ${id}: ${reply}`);
    }

    // @ts-ignore
    const ticket = await prisma.supportTicket.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
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
