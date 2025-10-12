import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/translator', '/dictionary', '/places', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for auth token in cookies or headers
    const authToken = request.cookies.get('authToken')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      // Redirect to login if no token is found
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
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