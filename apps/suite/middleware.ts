import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWLIST = ["/api/auth", "/_next", "/favicon.ico", "/static", "/assets"];

const SESSION_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  for (const prefix of ALLOWLIST) {
    if (path.startsWith(prefix)) return NextResponse.next();
  }

  const cookies = req.cookies;
  const hasSession = SESSION_COOKIE_NAMES.some(
    (name) => cookies.get(name)?.value
  );

  if (!hasSession) {
    url.pathname = "/api/auth/signin/keycloak";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
