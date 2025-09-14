import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthenticatedUser } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT (update) a category
async function putHandler(req: Request, { params }: { params: { categoryId: string } }, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name, icon, description } = await req.json();
    const { categoryId } = params;

    if (!name || !icon) {
      return NextResponse.json({ error: 'Name and icon are required' }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name, icon, description },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`Failed to update category ${params.categoryId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a category
async function deleteHandler(req: Request, { params }: { params: { categoryId: string } }, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { categoryId } = params;

    // Note: Prisma will cascade delete subcategories if the relation is set up correctly in schema.prisma
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete category ${params.categoryId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
