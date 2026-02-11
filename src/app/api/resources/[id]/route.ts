import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';

// GET /api/resources/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        createdBy: { select: { name: true, email: true } },
        updatedBy: { select: { name: true, email: true } },
      },
    });

    if (!resource) {
      return errorResponse('Resource not found', 404);
    }

    return jsonResponse({ success: true, data: resource });
  } catch (error) {
    console.error('GET /api/resources/[id] error:', error);
    return errorResponse('Failed to fetch resource', 500);
  }
}

// PUT /api/resources/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const body = await request.json();
    const existing = await prisma.resource.findUnique({ where: { id: params.id } });
    if (!existing) {
      return errorResponse('Resource not found', 404);
    }

    const updateData: any = { ...body, updatedById: (session!.user as any).id };

    if (body.publishDate) {
      updateData.publishDate = new Date(body.publishDate);
    }

    // Track publish/unpublish
    if (body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true },
    });

    const action = body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED'
      ? 'PUBLISH'
      : body.status === 'DRAFT' && existing.status === 'PUBLISHED'
        ? 'UNPUBLISH'
        : 'UPDATE';

    await logAudit({
      action,
      entityType: 'Resource',
      entityId: resource.id,
      userId: (session!.user as any).id,
      details: { title: resource.titleEn, changes: Object.keys(body) },
    });

    return jsonResponse({ success: true, data: resource });
  } catch (error) {
    console.error('PUT /api/resources/[id] error:', error);
    return errorResponse('Failed to update resource', 500);
  }
}

// DELETE /api/resources/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const resource = await prisma.resource.findUnique({ where: { id: params.id } });
    if (!resource) {
      return errorResponse('Resource not found', 404);
    }

    await prisma.resource.delete({ where: { id: params.id } });

    await logAudit({
      action: 'DELETE',
      entityType: 'Resource',
      entityId: params.id,
      userId: (session!.user as any).id,
      details: { title: resource.titleEn },
    });

    return jsonResponse({ success: true, message: 'Resource deleted' });
  } catch (error) {
    console.error('DELETE /api/resources/[id] error:', error);
    return errorResponse('Failed to delete resource', 500);
  }
}
