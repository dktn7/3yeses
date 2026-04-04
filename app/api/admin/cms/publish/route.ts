import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
    const authResponse = await requireAdmin(req);
    if (authResponse) return authResponse;

    try {
        const body = await req.json();
        const { pageSlug, locale, versionId } = body;

        // Upsert the published record
        const published = await prisma.publishedContent.upsert({
            where: {
                pageSlug_locale: {
                    pageSlug,
                    locale
                }
            },
            update: {
                versionId
            },
            create: {
                pageSlug,
                locale,
                versionId
            }
        });

        return NextResponse.json(published);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
    }
}
