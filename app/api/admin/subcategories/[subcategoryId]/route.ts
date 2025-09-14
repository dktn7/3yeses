import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { AuthenticatedUser } from '@/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT (update) a subcategory
async function putHandler(req: Request, { params }: { params: { subcategoryId: string } }, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { name } = await req.json();
    const { subcategoryId } = params;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updatedSubcategory = await prisma.subcategory.update({
      where: { id: subcategoryId },
      data: { name },
    });

    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error(`Failed to update subcategory ${params.subcategoryId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a subcategory
async function deleteHandler(req: Request, { params }: { params: { subcategoryId: string } }, user: AuthenticatedUser) {
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { subcategoryId } = params;

    await prisma.subcategory.delete({
      where: { id: subcategoryId },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete subcategory ${params.subcategoryId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
