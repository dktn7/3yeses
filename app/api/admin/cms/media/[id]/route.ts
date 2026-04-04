import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

export async function DELETE(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { id } = await context.params;

  try {
    // @ts-ignore
    await prisma.mediaAsset.delete({
      where: { id },
    });

    // TODO: Also delete from actual storage (S3/ImageKit) if applicable
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete media asset' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  const authResult = await verifyAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { altText, folder, filename } = body;

    // @ts-ignore
    const asset = await prisma.mediaAsset.update({
      where: { id },
      data: {
        altText,
        folder,
        filename,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating media asset:', error);
    return NextResponse.json(
      { error: 'Failed to update media asset' },
      { status: 500 }
    );
  }
}
