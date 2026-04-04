import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        const { id } = await context.params;
        await prisma.globalNotification.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete global notification:", error);
        return NextResponse.json({ error: "Failed to delete global notification" }, { status: 500 });
    }
}
