import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the shared SSO session cookie
  const sessionToken = request.cookies.get('darevel-session');

  // If no session token, redirect to auth service
  if (!sessionToken) {
    const signInUrl = new URL('http://auth.darevel.local/api/auth/signin');
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\..*|public).*)',
  ],
};
