import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/signin', '/signup', '/error', '/api/auth'];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPublicRoute && !req.auth) {
    // Redirect to auth service for centralized login
    const signInUrl = new URL('/api/auth/signin', process.env.NEXTAUTH_URL || 'http://darevel.local');
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

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
