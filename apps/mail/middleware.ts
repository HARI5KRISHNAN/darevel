import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  const sessionCookie =
    req.cookies.get("next-auth.session-token") ||
    req.cookies.get("__Secure-next-auth.session-token");

  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/auth/signin/keycloak";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
