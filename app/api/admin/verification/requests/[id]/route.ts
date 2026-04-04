
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/middleware/adminAuth";

// POST /api/admin/verification/requests/[id]
// Approve or Reject a request
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const adminUser = authResult.user;

    const { id } = await context.params;
    const body = await req.json();
    const { action, rejectionReason, notes } = body; // action: 'APPROVE' | 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
         return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const request = await prisma.verificationRequest.findUnique({
        where: { id },
        include: { talentProfile: true }
    });

    if (!request) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updateData: any = {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        notes: notes ? notes : request.notes,
        handlerId: adminUser.userId // Corrected: user object from token usually has userId
    };

    if (action === 'REJECT') {
        updateData.rejectionReason = rejectionReason;
    }

    // Update Request Status
    const updatedRequest = await prisma.verificationRequest.update({
        where: { id },
        data: updateData
    });

    // If Approved, update Talent Profile
    if (action === 'APPROVE') {
        await prisma.talentProfile.update({
            where: { userId: request.talentProfileId },
            data: { verified: true }
        });
        
        // TODO: Send notification to user
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error processing verification request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
