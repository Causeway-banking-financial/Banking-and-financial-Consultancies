import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth, getSearchParams } from '@/lib/api-helpers';
import { logAudit } from '@/lib/audit';
import { createSlug } from '@/lib/utils';
import { z } from 'zod';

const resourceSchema = z.object({
  titleEn: z.string().min(1, 'English title is required'),
  titleAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  contentEn: z.string().optional(),
  contentAr: z.string().optional(),
  type: z.enum(['REPORT', 'WHITEPAPER', 'ARTICLE', 'PRESENTATION', 'DATA', 'GUIDE', 'VIDEO', 'PODCAST', 'INFOGRAPHIC', 'OTHER']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featured: z.boolean().optional(),
  priority: z.number().optional(),
  publisher: z.string().optional(),
  publishDate: z.string().optional(),
  year: z.number().optional(),
  externalUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional().nullable(),
  metaTitleEn: z.string().optional(),
  metaDescEn: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescAr: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileMimeType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

// GET /api/resources - List resources (public + admin)
export async function GET(request: NextRequest) {
  try {
    const params = getSearchParams(request);
    const isAdmin = request.headers.get('x-admin') === 'true';

    const where: any = {};

    // Public requests only see published
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      where.status = params.status;
    }

    if (params.category) {
      where.categoryId = params.category;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.search) {
      where.OR = [
        { titleEn: { contains: params.search, mode: 'insensitive' } },
        { titleAr: { contains: params.search, mode: 'insensitive' } },
        { descriptionEn: { contains: params.search, mode: 'insensitive' } },
        { descriptionAr: { contains: params.search, mode: 'insensitive' } },
        { tags: { hasSome: [params.search] } },
      ];
    }

    const orderBy: any = {};
    switch (params.sort) {
      case 'oldest':
        orderBy.publishedAt = 'asc';
        break;
      case 'title':
        orderBy.titleEn = 'asc';
        break;
      default:
        orderBy.publishedAt = 'desc';
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: { category: true, createdBy: { select: { name: true } } },
        orderBy: [{ featured: 'desc' }, { priority: 'desc' }, orderBy],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.resource.count({ where }),
    ]);

    return jsonResponse({
      success: true,
      data: resources,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    });
  } catch (error) {
    console.error('GET /api/resources error:', error);
    return errorResponse('Failed to fetch resources', 500);
  }
}

// POST /api/resources - Create resource (admin only)
export async function POST(request: NextRequest) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const body = await request.json();
    const data = resourceSchema.parse(body);

    const slug = createSlug(data.titleEn);
    const existing = await prisma.resource.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const resource = await prisma.resource.create({
      data: {
        ...data,
        slug: finalSlug,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
        createdById: (session!.user as any).id,
        updatedById: (session!.user as any).id,
      },
      include: { category: true },
    });

    await logAudit({
      action: 'CREATE',
      entityType: 'Resource',
      entityId: resource.id,
      userId: (session!.user as any).id,
      details: { title: data.titleEn },
    });

    return jsonResponse({ success: true, data: resource }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors.map(e => e.message).join(', '), 400);
    }
    console.error('POST /api/resources error:', error);
    return errorResponse('Failed to create resource', 500);
  }
}
