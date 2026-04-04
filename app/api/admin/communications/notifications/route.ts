import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        const notifications = await prisma.globalNotification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch global notifications:", error);
        return NextResponse.json({ error: "Failed to fetch global notifications" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await requireAdmin(req);
    if (authResult) return authResult;

    try {
        const body = await req.json();
        const { title, message, type, targetRole, expiresAt, active } = body;

        if (!title || !message || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const notification = await prisma.globalNotification.create({
            data: {
                title,
                message,
                type,
                targetRole: targetRole === 'ALL' ? null : targetRole as UserRole,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: active ?? true
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Failed to create global notification:", error);
        return NextResponse.json({ error: "Failed to create global notification" }, { status: 500 });
    }
}
