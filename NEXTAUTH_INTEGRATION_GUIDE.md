# NextAuth Integration Guide for Remaining Apps

This guide explains how to integrate NextAuth SSO into the remaining Darevel Suite applications (Chat, Mail, Drive, Excel, Slides, Notify).

## Prerequisites

All apps must:
1. Have environment variables configured in `.env.local` (already done ✅)
2. Install `next-auth` package
3. Create NextAuth API route handler
4. Add authentication middleware
5. Use the shared session cookie configuration

---

## Step 1: Install Dependencies

For each app (chat, mail, drive, excel, slides, notify), run:

```bash
cd apps/<app-name>
npm install next-auth
```

---

## Step 2: Create Auth Configuration

Create `lib/auth.ts` in each app with the shared SSO configuration:

```typescript
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  cookies: {
    sessionToken: {
      name: "darevel-session", // MUST match across all apps
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // true in production with HTTPS
        domain: ".darevel.local", // Enable SSO across all subdomains
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.sub = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      session.user = {
        ...session.user,
        id: token.sub as string,
      };
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
```

---

## Step 3: Create NextAuth API Route

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

---

## Step 4: Add Authentication Middleware

Create `middleware.ts` in the app root:

```typescript
import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/api/auth'];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPublicRoute && !req.auth) {
    // Redirect to auth service for centralized login
    const signInUrl = new URL('/api/auth/signin', 'http://auth.darevel.local');
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

## Step 5: Update TypeScript Types

Create `types/next-auth.d.ts`:

```typescript
import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
```

---

## Step 6: Use Session in Components

### Client Component Example

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
    </div>
  );
}
```

### Server Component Example

```typescript
import { auth } from "@/lib/auth";

export default async function ServerComponent() {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Welcome, {session.user?.name}</p>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
```

---

## Step 7: Add Session Provider (Client Components)

Update your root layout to wrap the app with SessionProvider:

```typescript
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## Testing SSO Flow

1. **Start all services**:
   ```bash
   docker-compose up -d
   cd apps/suite && npm run dev &
   cd apps/auth && npm run dev &
   cd apps/chat && npm run dev &
   # ... start other apps
   ```

2. **Add DNS entries** to `/etc/hosts` (if not done):
   ```
   127.0.0.1 darevel.local
   127.0.0.1 auth.darevel.local
   127.0.0.1 chat.darevel.local
   # ... other domains
   ```

3. **Test SSO**:
   - Visit `http://darevel.local`
   - Login with `demo@darevel.com` / `demo123`
   - Navigate to `http://chat.darevel.local` - should be automatically logged in
   - Navigate to `http://mail.darevel.local` - should be automatically logged in

4. **Test Logout**:
   - Logout from Suite
   - Visit any app - should redirect to login

---

## Important Notes

### Cookie Domain
- **CRITICAL**: All apps MUST use `domain: ".darevel.local"` in cookie configuration
- The leading dot (`.`) is essential for subdomain sharing
- Cookie name MUST be `"darevel-session"` across all apps

### Keycloak Configuration
- Each app has its own Keycloak client configured in `keycloak/realm-export.json`
- Client secrets are app-specific (e.g., `darevel-chat-secret-2025`)
- All apps share the same realm: `pilot180`

### Redirect Flow
- Unauthenticated users are redirected to `auth.darevel.local`
- After login, they're redirected back to the original URL
- The `callbackUrl` parameter preserves the original destination

### Security
- In production, set `secure: true` for cookies (requires HTTPS)
- Use environment-specific secrets
- Enable CORS only for known domains
- Implement rate limiting on auth endpoints

---

## Troubleshooting

### Session not shared
- Verify cookie domain is `.darevel.local` (with leading dot)
- Check all apps use the same `NEXTAUTH_SECRET`
- Ensure accessing via `*.darevel.local` domains (not localhost:PORT)
- Clear browser cookies and try again

### Infinite redirect loop
- Check `NEXTAUTH_URL` matches the app's domain
- Verify Keycloak redirect URIs are correct
- Check middleware isn't blocking auth routes

### "Invalid client" error
- Verify `KEYCLOAK_CLIENT_ID` matches the realm configuration
- Check `KEYCLOAK_CLIENT_SECRET` is correct
- Ensure Keycloak is running and accessible

---

## Apps Integration Status

- [x] **Suite** (`darevel.local`) - ✅ Configured
- [x] **Auth** (`auth.darevel.local`) - ✅ Configured
- [ ] **Chat** (`chat.darevel.local`) - ⚠️ Pending integration
- [ ] **Mail** (`mail.darevel.local`) - ⚠️ Pending integration
- [ ] **Drive** (`drive.darevel.local`) - ⚠️ Pending integration
- [ ] **Excel** (`excel.darevel.local`) - ⚠️ Pending integration
- [ ] **Slides** (`slides.darevel.local`) - ⚠️ Pending integration
- [ ] **Notify** (`notify.darevel.local`) - ⚠️ Pending integration

Follow the steps above to integrate each remaining app into the SSO ecosystem.
