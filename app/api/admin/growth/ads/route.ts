
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateUser } from "@/lib/auth/middleware";
import { AdPosition } from "@prisma/client";

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
    const ads = await prisma.adBanner.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const body = await req.json();
    const { title, imageUrl, linkUrl, position, startDate, endDate, active } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ad = await prisma.adBanner.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        position: position as AdPosition,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active: active ?? true,
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const body = await req.json();
    const { id, title, imageUrl, linkUrl, position, startDate, endDate, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ad ID" }, { status: 400 });
    }

    const ad = await prisma.adBanner.update({
      where: { id },
      data: {
        title,
        imageUrl,
        linkUrl,
        position: position as AdPosition,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active,
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing ad ID" }, { status: 400 });
    }

    await prisma.adBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
