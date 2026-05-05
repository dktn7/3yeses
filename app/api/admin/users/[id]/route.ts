import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';

async function getHandler(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  try {
    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        talentProfile: {
          include: {
            category: true,
            subcategory: true,
            portfolio: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        mediaAssetsUploaded: {
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            comments: true,
            profileLikes: true,
            reportsCreated: true,
            reportsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

async function patchHandler(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  try {
    const body = await request.json();
    const { name, email, role, emailVerified, action, reason } = body;

    // Handle special actions
    if (action === 'warn' || action === 'ban' || action === 'suspend' || action === 'unban') {
      if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

      // Log the action in audit log
      try {
        const { createAuditLog } = await import('@/lib/admin/audit');
        await createAuditLog({
          action: action === 'warn' ? 'WARN_USER' : action === 'ban' ? 'BAN_USER' : action === 'suspend' ? 'SUSPEND_USER' : 'UNBAN_USER',
          userId: context.admin?.userId || 'system',
          details: { targetUserId: id, reason: reason || 'No reason provided' },
        });
      } catch {
        // Audit log is non-critical
      }

      if (action === 'ban') {
        // Set role to banned state by updating settings
        await prisma.user.update({
          where: { id },
          data: {
            settings: { banned: true, bannedAt: new Date().toISOString(), banReason: reason || '' },
          },
        });
        return NextResponse.json({ success: true, message: 'User banned' });
      }

      if (action === 'unban') {
        await prisma.user.update({
          where: { id },
          data: {
            settings: { banned: false },
          },
        });
        return NextResponse.json({ success: true, message: 'User unbanned' });
      }

      if (action === 'warn') {
        // Add a persistent talent notification for the warning
        const talentProfile = await prisma.talentProfile.findUnique({ where: { userId: id } });

        if (talentProfile) {
          await prisma.talentNotification.create({
            data: {
              talentProfileId: talentProfile.userId,
              type: 'SYSTEM',
              title: 'Account Warning',
              message: reason || 'Your account was flagged by the admin team for policy review. Please check your notifications for next steps.',
              read: false,
              dismissed: false,
              metadata: { adminAction: 'warn', reason: reason || null },
            },
          });
        }

        return NextResponse.json({ success: true, message: 'User warned' });
      }

      // suspend is still logged, but we keep warn surfaced in notifications.
      return NextResponse.json({ success: true, message: `User ${action}ed` });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified ? new Date() : null;
    }

    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const user = await prisma.user.update({ where: { id }, data: updateData });

    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

async function deleteHandler(request: NextRequest, context: any) {
  const params = context?.params ?? { id: undefined };
  const resolvedParams = typeof (params as any)?.then === 'function' ? await (params as any) : params;
  const id = resolvedParams?.id;
  try {
    // Check if user exists
    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(getHandler);
export const PATCH = withAdminAuth(patchHandler);
export const DELETE = withAdminAuth(deleteHandler);
