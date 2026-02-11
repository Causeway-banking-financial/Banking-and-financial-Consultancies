import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jsonResponse, errorResponse, requireAuth } from '@/lib/api-helpers';

// GET /api/health - Public health check
export async function GET(request: NextRequest) {
  const isAdmin = request.headers.get('x-admin') === 'true';

  try {
    // Basic DB connectivity check
    await prisma.$queryRaw`SELECT 1`;
    const dbOk = true;

    if (!isAdmin) {
      return jsonResponse({ status: 'ok', database: dbOk });
    }

    // Admin gets detailed health info
    const [
      resourceCount,
      draftCount,
      publishedCount,
      categoryCount,
      pageCount,
      brokenLinks,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.resource.count(),
      prisma.resource.count({ where: { status: 'DRAFT' } }),
      prisma.resource.count({ where: { status: 'PUBLISHED' } }),
      prisma.category.count(),
      prisma.page.count(),
      prisma.linkCheck.count({ where: { isBroken: true } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ]);

    // Check for missing translations
    const [missingArResources, missingArPages] = await Promise.all([
      prisma.resource.count({
        where: { status: 'PUBLISHED', OR: [{ titleAr: null }, { titleAr: '' }] },
      }),
      prisma.page.count({
        where: { status: 'PUBLISHED', OR: [{ titleAr: null }, { titleAr: '' }] },
      }),
    ]);

    return jsonResponse({
      success: true,
      data: {
        database: dbOk,
        storage: true,
        resources: { total: resourceCount, draft: draftCount, published: publishedCount },
        categories: categoryCount,
        pages: pageCount,
        brokenLinks,
        missingTranslations: missingArResources + missingArPages,
        missingArResources,
        missingArPages,
        recentActivity: recentAuditLogs,
        lastCheckAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return jsonResponse({
      status: 'error',
      database: false,
      error: 'Database connection failed',
    }, 503);
  }
}

// POST /api/health - Run link check (admin only)
export async function POST(request: NextRequest) {
  const { authorized, session, response } = await requireAuth();
  if (!authorized) return response!;

  try {
    const resources = await prisma.resource.findMany({
      where: { status: 'PUBLISHED', externalUrl: { not: null } },
      select: { id: true, externalUrl: true },
    });

    let checked = 0;
    let broken = 0;

    for (const resource of resources) {
      if (!resource.externalUrl) continue;

      try {
        const res = await fetch(resource.externalUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000),
        });

        await prisma.linkCheck.upsert({
          where: { id: `${resource.id}-url` },
          create: {
            id: `${resource.id}-url`,
            url: resource.externalUrl,
            status: res.status,
            statusText: res.statusText,
            sourceType: 'Resource',
            sourceId: resource.id,
            isBroken: !res.ok,
          },
          update: {
            status: res.status,
            statusText: res.statusText,
            isBroken: !res.ok,
            lastChecked: new Date(),
          },
        });

        if (!res.ok) broken++;
      } catch {
        await prisma.linkCheck.upsert({
          where: { id: `${resource.id}-url` },
          create: {
            id: `${resource.id}-url`,
            url: resource.externalUrl!,
            status: 0,
            statusText: 'Connection failed',
            sourceType: 'Resource',
            sourceId: resource.id,
            isBroken: true,
          },
          update: {
            status: 0,
            statusText: 'Connection failed',
            isBroken: true,
            lastChecked: new Date(),
          },
        });
        broken++;
      }
      checked++;
    }

    return jsonResponse({
      success: true,
      data: { checked, broken, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return errorResponse('Link check failed', 500);
  }
}
