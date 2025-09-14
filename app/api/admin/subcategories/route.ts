import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthenticatedUser } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST a new subcategory
async function postHandler(req: Request, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, categoryId } = await req.json();
    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and categoryId are required' }, { status: 400 });
    }

    const newSubcategory = await prisma.subcategory.create({
      data: { name, categoryId },
    });
    return NextResponse.json(newSubcategory, { status: 201 });
  } catch (error) {
    console.error('Failed to create subcategory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(postHandler);
