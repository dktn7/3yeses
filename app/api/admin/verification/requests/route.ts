
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";

// GET /api/admin/verification/requests
// List verification requests
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.verificationRequest.findMany({
        where,
        include: {
          talentProfile: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.verificationRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification requests" },
      { status: 500 }
    );
  }
}

// POST /api/admin/verification/requests
// Create a manual verification request (e.g. if a user emailed docs)
export async function POST(req: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(req);
        if (authResult instanceof NextResponse) {
          return authResult;
        }

        const body = await req.json();
        const { talentProfileId, type, documents, notes } = body;

        const request = await prisma.verificationRequest.create({
            data: {
                talentProfileId,
                type: type || 'IDENTITY',
                documents: documents || [],
                notes,
                status: 'PENDING'
            }
        });

        return NextResponse.json(request);

    } catch (error) {
        console.error("Error creating verification request:", error);
        return NextResponse.json(
          { error: "Failed to create verification request" },
          { status: 500 }
        );
    }
}
