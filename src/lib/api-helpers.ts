import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { authorized: false, session: null, response: errorResponse('Unauthorized', 401) };
  }
  return { authorized: true, session, response: null };
}

export async function requireAdmin(request?: NextRequest) {
  const { authorized, session, response } = await requireAuth(request);
  if (!authorized) return { authorized: false, session: null, response };
  if ((session?.user as any)?.role !== 'ADMIN') {
    return { authorized: false, session, response: errorResponse('Admin access required', 403) };
  }
  return { authorized: true, session, response: null };
}

export function getSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    type: searchParams.get('type') || undefined,
    status: searchParams.get('status') || undefined,
    sort: searchParams.get('sort') || 'latest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: Math.min(parseInt(searchParams.get('limit') || '20', 10), 100),
    locale: searchParams.get('locale') || 'en',
  };
}
