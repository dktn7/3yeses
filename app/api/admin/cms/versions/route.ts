import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
    const authResponse = await requireAdmin(req);
    if (authResponse) return authResponse;

    try {
        const body = await req.json();
        const { pageSlug, locale, title, content, changeNote, authorId } = body;

        // Verify page exists
        const page = await prisma.contentPage.findUnique({ where: { slug: pageSlug } });
        if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

        const version = await prisma.contentVersion.create({
            data: {
                pageSlug,
                locale,
                title,
                content,
                changeNote,
                authorId
            }
        });

        return NextResponse.json(version);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
    }
}
