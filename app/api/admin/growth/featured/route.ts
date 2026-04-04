
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth/middleware";

async function requireAdmin(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.authenticated || !auth.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (auth.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: auth.user };
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const featuredItems = await prisma.featuredItem.findMany({
      include: {
        talentProfile: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        portfolioItem: true,
      },
      orderBy: { priority: "desc" },
    });
    return NextResponse.json(featuredItems);
  } catch (error) {
    console.error("Error fetching featured items:", error);
    return NextResponse.json({ error: "Failed to fetch featured items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const body = await req.json();
    const { 
      talentProfileId, 
      portfolioItemId, 
      title, 
      description, 
      slot, 
      priority, 
      startDate, 
      endDate, 
      active 
    } = body;

    if (!slot) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const featuredItem = await prisma.featuredItem.create({
      data: {
        talentProfileId,
        portfolioItemId,
        title,
        description,
        slot,
        priority: priority ? parseInt(priority) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active: active ?? true,
      },
    });

    return NextResponse.json(featuredItem);
  } catch (error) {
    console.error("Error creating featured item:", error);
    return NextResponse.json({ error: "Failed to create featured item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const body = await req.json();
    const { 
      id,
      talentProfileId, 
      portfolioItemId, 
      title, 
      description, 
      slot, 
      priority, 
      startDate, 
      endDate, 
      active 
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing featured item ID" }, { status: 400 });
    }

    const featuredItem = await prisma.featuredItem.update({
      where: { id },
      data: {
        talentProfileId,
        portfolioItemId,
        title,
        description,
        slot,
        priority: priority ? parseInt(priority) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active,
      },
    });

    return NextResponse.json(featuredItem);
  } catch (error) {
    console.error("Error updating featured item:", error);
    return NextResponse.json({ error: "Failed to update featured item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing featured item ID" }, { status: 400 });
    }

    await prisma.featuredItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting featured item:", error);
    return NextResponse.json({ error: "Failed to delete featured item" }, { status: 500 });
  }
}
