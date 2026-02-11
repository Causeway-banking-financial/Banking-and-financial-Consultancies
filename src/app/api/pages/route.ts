import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import { createSlug } from '@/lib/utils';
import { z } from 'zod';

const pageSchema = z.object({
  titleEn: z.string().min(1, 'English title is required'),
  titleAr: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  template: z.string().optional(),
  showInNav: z.boolean().optional(),
  sortOrder: z.number().optional(),
  contentEn: z.string().optional(),
  contentAr: z.string().optional(),
  blocksEn: z.any().optional(),
  blocksAr: z.any().optional(),
  metaTitleEn: z.string().optional(),
  metaDescEn: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescAr: z.string().optional(),
});

// GET /api/pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const where: any = {};
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    }

    const pages = await prisma.page.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return jsonResponse({ success: true, data: pages });
  } catch (error) {
    return errorResponse('Failed to fetch pages', 500);
  }
}

// POST /api/pages
export async function POST(request: NextRequest) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const body = await request.json();
    const data = pageSchema.parse(body);

    const slug = data.slug || createSlug(data.titleEn);
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse('A page with this slug already exists', 400);
    }

    const page = await prisma.page.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
      },
    });

    await logAudit({
      action: 'CREATE',
      entityType: 'Page',
      entityId: page.id,
      userId: (session!.user as any).id,
      details: { title: data.titleEn, slug },
    });

    return jsonResponse({ success: true, data: page }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors.map(e => e.message).join(', '), 400);
    }
    return errorResponse('Failed to create page', 500);
  }
}
