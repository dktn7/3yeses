export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { createAuditLog } from '@/lib/admin/audit';
import { generateNextUserId } from '@/lib/id-generator';

async function handler(request: NextRequest, context: { admin: any }) {
  try {
    const adminUser = context.admin;
    
    // Audit logging: User access
    await createAuditLog({
      action: 'VIEW_USERS',
      userId: adminUser.userId,
      details: { url: request.url }
    });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const userId = searchParams.get('userId') || '';

    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    if (userId) {
      where.id = userId;
    } else if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }

    if (status === 'active') {
      where.emailVerified = { not: null };
    } else if (status === 'unverified') {
      where.emailVerified = null;
    }

    if (categoryId && categoryId !== 'all') {
      where.talentProfile = {
        categoryId: categoryId
      };
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          talentProfile: {
            select: {
              userId: true,
              bio: true,
              avatarUrl: true,
              category: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handler);

async function createUserHandler(request: NextRequest, context: { admin: Record<string, unknown> }) {
  try {
    const adminUser = context.admin;
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const validRoles = ['USER', 'TALENT', 'ADMIN'];
    const userRole = validRoles.includes(role) ? role : 'TALENT';

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await generateNextUserId();

    const user = await prisma.user.create({
      data: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: userRole,
        emailVerified: new Date(), // Admin-created users are pre-verified
      },
    });

    await createAuditLog({
      action: 'CREATE_USER',
      userId: adminUser.userId as string,
      details: { createdUserId: user.id, email: user.email, role: userRole },
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export const POST = withAdminAuth(createUserHandler);
