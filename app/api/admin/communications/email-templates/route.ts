import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
    const authResponse = await requireAdmin(req);
    if (authResponse) return authResponse;

    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { lastUpdated: 'desc' }
        });
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResponse = await requireAdmin(req);
    if (authResponse) return authResponse;

    try {
        const body = await req.json();
        const { id, name, subject, body: content, variables } = body;

        // Upsert
        const template = await prisma.emailTemplate.upsert({
            where: { id },
            update: { name, subject, body: content, variables },
            create: { id, name, subject, body: content, variables }
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
    }
}
