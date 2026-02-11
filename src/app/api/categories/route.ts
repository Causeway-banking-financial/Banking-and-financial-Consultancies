import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import { createSlug } from '@/lib/utils';
import { z } from 'zod';

const categorySchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().optional(),
  parentId: z.string().optional().nullable(),
});

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    const where: any = {};
    if (!includeDisabled) {
      where.enabled = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: { select: { resources: true } },
        children: {
          include: { _count: { select: { resources: true } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return jsonResponse({ success: true, data: categories });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    const slug = createSlug(data.nameEn);
    const existing = await prisma.category.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const category = await prisma.category.create({
      data: { ...data, slug: finalSlug },
    });

    await logAudit({
      action: 'CREATE',
      entityType: 'Category',
      entityId: category.id,
      userId: (session!.user as any).id,
      details: { name: data.nameEn },
    });

    return jsonResponse({ success: true, data: category }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors.map(e => e.message).join(', '), 400);
    }
    console.error('POST /api/categories error:', error);
    return errorResponse('Failed to create category', 500);
  }
}
