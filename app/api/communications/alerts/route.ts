import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        const alerts = await prisma.globalNotification.findMany({
            where: {
                active: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Map Prisma enum to the frontend expected type if necessary, 
        // though the plan implies they match.
        // Frontend expects: type: 'INFO' | 'WARNING' | 'CRITICAL'
        // Schema has: enum GlobalNotificationType { INFO WARNING CRITICAL }
        // So direct return is fine.

        return NextResponse.json(alerts);
    } catch (error) {
        console.error("Failed to fetch alerts:", error);
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
}
