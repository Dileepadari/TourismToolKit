import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next 16 renamed the middleware convention to `proxy.ts` with a default export.

// Routes reachable without a session.
// `/auth/forgot-password` used to be in neither list and worked only by falling
// through the protected check - a fragile default for an auth route.
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

const protectedRoutes = ['/dashboard', '/translator', '/dictionary', '/places', '/settings', '/trips'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // `tt_session` is a non-secret marker cookie set alongside the HttpOnly
    // credentials - the guard only needs to know whether a session exists, and
    // it cannot read the HttpOnly ones anyway. The real check happens server-side
    // on every GraphQL call.
    const hasSession =
      request.cookies.get('tt_session')?.value ||
      request.cookies.get('tt_access')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!hasSession) {
      const loginUrl = new URL('/auth/login', request.url);
      // Read back by the login page so the user lands where they were headed.
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Everything except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
