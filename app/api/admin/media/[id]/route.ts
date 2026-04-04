import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

// DELETE a portfolio item or media asset by id
async function deleteHandler(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;

  try {
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'portfolio' or 'media'

    if (type === 'media') {
      const asset = await prisma.mediaAsset.findUnique({ where: { id } });
      if (!asset) return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
      await prisma.mediaAsset.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Media asset deleted' });
    }

    // Default: portfolio item
    const item = await prisma.portfolioItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    await prisma.portfolioItem.delete({ where: { id } });

    // Log in audit
    try {
      const { createAuditLog } = await import('@/lib/admin/audit');
      await createAuditLog({
        action: 'DELETE_PORTFOLIO_ITEM',
        userId: context.admin?.userId || 'system',
        details: { portfolioItemId: id, title: item.title },
      });
    } catch {
      // Audit log is non-critical
    }

    return NextResponse.json({ success: true, message: 'Portfolio item deleted' });
  } catch (error) {
    console.error('Admin media delete error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export const DELETE = withAdminAuth(deleteHandler);
