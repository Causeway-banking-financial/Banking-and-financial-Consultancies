import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        resources: { orderBy: { publishedAt: 'desc' }, take: 20 },
        children: true,
        _count: { select: { resources: true } },
      },
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return jsonResponse({ success: true, data: category });
  } catch (error) {
    return errorResponse('Failed to fetch category', 500);
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const body = await request.json();
    const category = await prisma.category.update({
      where: { id: params.id },
      data: body,
    });

    await logAudit({
      action: 'UPDATE',
      entityType: 'Category',
      entityId: category.id,
      userId: (session!.user as any).id,
      details: { name: category.nameEn, changes: Object.keys(body) },
    });

    return jsonResponse({ success: true, data: category });
  } catch (error) {
    return errorResponse('Failed to update category', 500);
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { resources: true } } },
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    if (category._count.resources > 0) {
      return errorResponse('Cannot delete category with assigned resources. Reassign resources first.', 400);
    }

    await prisma.category.delete({ where: { id: params.id } });

    await logAudit({
      action: 'DELETE',
      entityType: 'Category',
      entityId: params.id,
      userId: (session!.user as any).id,
      details: { name: category.nameEn },
    });

    return jsonResponse({ success: true, message: 'Category deleted' });
  } catch (error) {
    return errorResponse('Failed to delete category', 500);
  }
}
