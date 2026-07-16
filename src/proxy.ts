import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip proxy for static files, API routes, and Next.js internals
  // Although the config matcher should handle most of this, it's good as a fallback
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // like .png, .css
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const sessionCookie = request.cookies.get('session');
  let session = null;

  if (sessionCookie) {
    session = await decrypt(sessionCookie.value);
  }

  // If trying to access protected route without session, redirect to login
  if (!isPublicRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access public route (like login) WITH a session, redirect to dashboard
  if (isPublicRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
