import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for admin routes, API routes, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|admin|images|.*\\..*).*)'],
};
