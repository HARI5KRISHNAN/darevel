import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/signin', '/signup', '/error', '/api/auth'];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the shared SSO session cookie
  const sessionToken = request.cookies.get('next-auth.session-token') ||
                       request.cookies.get('__Secure-next-auth.session-token') ||
                       request.cookies.get('__Host-next-auth.session-token');

  // If no session token, redirect to auth service for centralized login
  if (!sessionToken) {
    const signInUrl = new URL('http://auth.darevel.local:3005/api/auth/signin/keycloak');
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
