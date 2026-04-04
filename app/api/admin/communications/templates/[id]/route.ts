import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        const { id } = await context.params;
        const body = await req.json();
        const { name, subject, body: templateBody, variables } = body;

        const template = await prisma.emailTemplate.update({
            where: { id },
            data: {
                name,
                subject,
                body: templateBody,
                variables
            }
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Failed to update email template:", error);
        return NextResponse.json({ error: "Failed to update email template" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        const { id } = await context.params;
        await prisma.emailTemplate.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete email template:", error);
        return NextResponse.json({ error: "Failed to delete email template" }, { status: 500 });
    }
}
