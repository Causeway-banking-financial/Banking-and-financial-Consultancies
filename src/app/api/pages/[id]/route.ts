import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';

// GET /api/pages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Allow lookup by ID or slug
    const page = await prisma.page.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!page) {
      return errorResponse('Page not found', 404);
    }

    return jsonResponse({ success: true, data: page });
  } catch (error) {
    return errorResponse('Failed to fetch page', 500);
  }
}

// PUT /api/pages/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const body = await request.json();
    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return errorResponse('Page not found', 404);
    }

    const updateData: any = { ...body };
    if (body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: updateData,
    });

    await logAudit({
      action: body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED' ? 'PUBLISH' : 'UPDATE',
      entityType: 'Page',
      entityId: page.id,
      userId: (session!.user as any).id,
      details: { title: page.titleEn, changes: Object.keys(body) },
    });

    return jsonResponse({ success: true, data: page });
  } catch (error) {
    return errorResponse('Failed to update page', 500);
  }
}

// DELETE /api/pages/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const page = await prisma.page.findUnique({ where: { id: params.id } });
    if (!page) {
      return errorResponse('Page not found', 404);
    }

    await prisma.page.delete({ where: { id: params.id } });

    await logAudit({
      action: 'DELETE',
      entityType: 'Page',
      entityId: params.id,
      userId: (session!.user as any).id,
      details: { title: page.titleEn },
    });

    return jsonResponse({ success: true, message: 'Page deleted' });
  } catch (error) {
    return errorResponse('Failed to delete page', 500);
  }
}
