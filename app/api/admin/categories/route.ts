import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthenticatedUser } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all categories with subcategories
async function getHandler(req: Request, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new category
async function postHandler(req: Request, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, icon, description } = await req.json();
    if (!name || !icon) {
      return NextResponse.json({ error: 'Name and icon are required' }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: { name, icon, description },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
