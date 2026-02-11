import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse } from '@/lib/api-helpers';

// GET /api/search?q=keyword&type=resources|pages|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    if (!q || q.length < 2) {
      return errorResponse('Search query must be at least 2 characters', 400);
    }

    const results: any = {};

    if (type === 'all' || type === 'resources') {
      results.resources = await prisma.resource.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { titleEn: { contains: q, mode: 'insensitive' } },
            { titleAr: { contains: q, mode: 'insensitive' } },
            { descriptionEn: { contains: q, mode: 'insensitive' } },
            { descriptionAr: { contains: q, mode: 'insensitive' } },
            { tags: { hasSome: [q] } },
            { publisher: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { category: { select: { nameEn: true, nameAr: true } } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });
    }

    if (type === 'all' || type === 'pages') {
      results.pages = await prisma.page.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { titleEn: { contains: q, mode: 'insensitive' } },
            { titleAr: { contains: q, mode: 'insensitive' } },
            { contentEn: { contains: q, mode: 'insensitive' } },
            { contentAr: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    }

    return jsonResponse({ success: true, data: results, query: q });
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse('Search failed', 500);
  }
}
