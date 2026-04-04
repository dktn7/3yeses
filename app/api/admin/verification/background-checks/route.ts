
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";

// GET /api/admin/verification/background-checks
// List background checks
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [checks, total] = await Promise.all([
      prisma.backgroundCheck.findMany({
        include: {
            talentProfile: {
                include: {
                    user: {
                        select: { name: true, email: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.backgroundCheck.count(),
    ]);

    return NextResponse.json({
      checks,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching background checks:", error);
    return NextResponse.json(
      { error: "Failed to fetch background checks" },
      { status: 500 }
    );
  }
}

// POST /api/admin/verification/background-checks
// Trigger a background check (Mock integration)
export async function POST(req: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(req);
        if (authResult instanceof NextResponse) {
          return authResult;
        }

        const body = await req.json();
        const { talentProfileId, provider } = body;

        // Mock Checkr Integration
        // const checkrId = await checkr.createCandidate(...)

        const check = await prisma.backgroundCheck.create({
            data: {
                talentProfileId,
                provider: provider || 'Checkr',
                status: 'PENDING',
                providerId: `mock_chk_${Date.now()}`
            }
        });

        return NextResponse.json(check);

    } catch (error) {
        console.error("Error creating background check:", error);
        return NextResponse.json(
          { error: "Failed to create background check" },
          { status: 500 }
        );
    }
}
