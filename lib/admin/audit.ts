import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface AuditLogOptions {
  action: string;
  userId: string;
  details?: Record<string, any>;
}

export async function createAuditLog({ action, userId, details }: AuditLogOptions) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await prisma.activityLog.create({
      data: {
        action,
        userId,
        details: details || {},
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid disrupting the main flow
  }
}

export async function getAuditLogs(limit = 100, offset = 0) {
  return await prisma.activityLog.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
