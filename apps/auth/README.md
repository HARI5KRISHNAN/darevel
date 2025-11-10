# Darevel Auth - Authentication Service

Single Sign-On (SSO) authentication service for all Darevel applications using NextAuth.js and Keycloak.

## Overview

This is the central authentication service that provides:
- Single Sign-On (SSO) across all Darevel apps
- Integration with Keycloak OAuth2/OIDC
- Session management with JWT
- Secure token handling

## Configuration

### Environment Variables

The following environment variables are required (see `.env.local`):

```env
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=darevel-sso-secret-change-in-production
KEYCLOAK_CLIENT_ID=darevel-auth
KEYCLOAK_CLIENT_SECRET=darevel-auth-secret-2025
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

### Keycloak Client Configuration

The `darevel-auth` client in Keycloak should have:
- Client ID: `darevel-auth`
- Client Secret: `darevel-auth-secret-2025`
- Access Type: `confidential` (not public)
- Valid Redirect URIs:
  - `http://localhost:3005/*`
  - `http://localhost:3005/api/auth/callback/keycloak`
  - `http://auth.darevel.local:3005/*`
- Web Origins: `http://localhost:3005`, `http://auth.darevel.local:3005`, `+`

## Running the App

### Development Mode

```bash
npm run dev
```

The app will start on http://localhost:3005

### Production Build

```bash
npm run build
npm start
```

## Usage

### For Users

1. Visit http://localhost:3005
2. Click "Sign in with Keycloak"
3. Enter your credentials on the Keycloak login page
4. You'll be redirected back and authenticated
5. Access other Darevel apps without re-entering credentials

### For Developers

#### Getting the Session

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not logged in</div>;

  return <div>Welcome {session?.user?.name}</div>;
}
```

#### Protecting Routes

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return <div>Protected content</div>;
}
```

#### Signing Out

```tsx
"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/signin" })}>
      Sign Out
    </button>
  );
}
```

## Architecture

### Authentication Flow

1. User clicks "Sign in with Keycloak"
2. NextAuth redirects to Keycloak login page
3. User enters credentials
4. Keycloak validates and returns authorization code
5. NextAuth exchanges code for tokens
6. Session is created with JWT strategy
7. User is redirected to the app

### Session Management

- **Strategy**: JWT (stateless)
- **Duration**: 30 days
- **Storage**: HTTP-only cookies
- **Refresh**: Automatic on page load

### Security Features

- CSRF protection (built into NextAuth)
- Secure cookie handling
- Token encryption
- HTTP-only cookies
- Same-site cookie policy

## Troubleshooting

### Redirect Loop After Login

**Symptom**: After Keycloak callback, redirected back to signin page

**Solution**: Ensure:
1. `.env.local` file exists with correct values
2. `NEXTAUTH_SECRET` is set
3. Keycloak client secret matches
4. Redirect URIs in Keycloak include `/api/auth/callback/keycloak`

### "Configuration Error"

**Symptom**: NextAuth shows configuration error

**Solution**:
1. Verify all environment variables are set
2. Restart the dev server
3. Clear browser cookies
4. Check Keycloak is running: http://localhost:8080

### Session Not Persisting

**Symptom**: User logged out after page refresh

**Solution**:
1. Check browser accepts cookies
2. Verify `NEXTAUTH_SECRET` is consistent
3. Ensure session callbacks return correct data

### CORS Errors

**Symptom**: Cross-origin errors when calling API

**Solution**:
1. Add origin to Keycloak Web Origins
2. Add redirect URI to Keycloak Valid Redirect URIs
3. Use `+` in Web Origins for wildcard

## Testing

### Manual Testing

1. Start Keycloak: `npm run dev:docker` (from root)
2. Start auth app: `npm run dev`
3. Visit http://localhost:3005
4. Click "Sign in with Keycloak"
5. Login with demo user:
   - Email: `demo@darevel.com`
   - Password: `demo123`
6. Verify you see the welcome page
7. Click "Sign Out" and verify redirect to signin

### Integration Testing

Test SSO by:
1. Login to auth app
2. Open another Darevel app (e.g., http://localhost:3000)
3. Verify automatically logged in without password prompt

## Dependencies

- **next**: ^15.1.5 - React framework
- **next-auth**: ^4.24.11 - Authentication library
- **react**: ^19.0.0 - UI library
- **react-dom**: ^19.0.0 - React DOM renderer

## File Structure

```
apps/auth/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts       # NextAuth configuration
│   ├── signin/
│   │   └── page.tsx              # Sign-in page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home/dashboard page
│   ├── providers.tsx             # Client providers
│   └── globals.css               # Global styles
├── types/
│   └── next-auth.d.ts            # TypeScript definitions
├── .env.local                    # Environment variables (not in git)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Production Deployment

Before deploying to production:

1. **Generate Strong Secret**
   ```bash
   openssl rand -base64 32
   ```
   Use output for `NEXTAUTH_SECRET`

2. **Update URLs**
   ```env
   NEXTAUTH_URL=https://auth.yourdomain.com
   KEYCLOAK_ISSUER=https://keycloak.yourdomain.com/realms/pilot180
   ```

3. **Update Keycloak Client**
   - Add production redirect URIs
   - Add production web origins
   - Use strong client secret

4. **Enable HTTPS**
   - All auth must use HTTPS in production
   - Configure SSL certificates
   - Set secure cookie flags

5. **Security Hardening**
   - Rotate secrets regularly
   - Enable rate limiting
   - Monitor authentication logs
   - Configure session timeout appropriately

## Support

For issues or questions:
1. Check this README
2. Review logs: `npm run dev` output
3. Check Keycloak logs: `npm run logs:keycloak` (from root)
4. Review main documentation in `/docs`

## License

Part of the Darevel Suite monorepo.
