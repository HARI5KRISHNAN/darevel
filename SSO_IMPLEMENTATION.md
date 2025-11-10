# Single Sign-On (SSO) Implementation Guide

Complete guide to implementing Google Workspace-style SSO across all Darevel apps.

## Vision

**One login, access everything:**
- Log in once at `auth.darevel.local:3005`
- Automatic access to all apps:
  - suite.darevel.local:3000
  - slides.darevel.local:3001
  - chat.darevel.local:3002
  - mail.darevel.local:3003
  - excel.darevel.local:3004
  - drive.darevel.local:3006
  - notify.darevel.local:3007

## Architecture

```
User Browser
  ↓
Any App (*.darevel.local)
  ↓
Check Session (Redis)
  ├─ Has Session? → Allow Access
  └─ No Session? → Redirect to auth.darevel.local:3005
       ↓
    Keycloak Login (localhost:8080)
       ↓
    Create Session in Redis
       ↓
    Redirect back to original app
       ↓
    User is logged in!
```

## Current Challenge

We have two types of apps:
- **Next.js apps** (Suite, Slides, Auth, Drive, Notify) - Can use NextAuth.js
- **Vite apps** (Chat, Mail, Excel) - Need different approach

## Solution: Two-Tier SSO

### Tier 1: Keycloak JS for Vite Apps
Vite apps use `keycloak-js` client library directly.

### Tier 2: NextAuth.js for Next.js Apps
Next.js apps use NextAuth.js with Keycloak provider.

### Shared Session Store: Redis
Both tiers share session data via Redis for true SSO.

## Implementation Steps

### Step 1: Configure Local Domains

**Windows (Run PowerShell as Administrator):**
```powershell
Add-Content C:\Windows\System32\drivers\etc\hosts @"
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
"@
```

**Linux/Mac:**
```bash
sudo tee -a /etc/hosts << EOF
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
EOF
```

**Verify:**
```bash
ping suite.darevel.local
# Should ping 127.0.0.1
```

### Step 2: Update Keycloak Realm Configuration

Edit `keycloak/realm-export.json`, update **ALL** clients with wildcards:

```json
{
  "clients": [
    {
      "clientId": "ai-email-assistant",
      "redirectUris": [
        "http://localhost:3003/*",
        "http://mail.darevel.local:3003/*",
        "http://mail.darevel.local:3003/callback"
      ],
      "webOrigins": [
        "http://localhost:3003",
        "http://mail.darevel.local:3003",
        "+"
      ]
    },
    {
      "clientId": "darevel-chat",
      "redirectUris": [
        "http://localhost:3002/*",
        "http://chat.darevel.local:3002/*"
      ],
      "webOrigins": [
        "http://localhost:3002",
        "http://chat.darevel.local:3002",
        "+"
      ]
    }
    // ... repeat for all clients
  ]
}
```

**Restart to apply:**
```bash
npm run clean  # Destroys existing realm
npm run dev    # Imports updated config
```

### Step 3: Implement SSO for Vite Apps (Mail, Chat, Excel)

#### Install Keycloak JS

```bash
cd apps/mail
npm install keycloak-js

cd ../chat
npm install keycloak-js

cd ../excel
npm install keycloak-js
```

#### Create Shared Keycloak Config

**apps/mail/src/keycloak.ts:**
```typescript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'pilot180',
  clientId: 'ai-email-assistant'
});

export default keycloak;
```

**apps/chat/src/keycloak.ts:**
```typescript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'pilot180',
  clientId: 'darevel-chat'
});

export default keycloak;
```

**apps/excel/src/keycloak.ts:**
```typescript
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'pilot180',
  clientId: 'darevel-excel'
});

export default keycloak;
```

#### Update App Entry Point

**apps/mail/src/main.tsx:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import keycloak from './keycloak';

// Initialize Keycloak
keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false,
  redirectUri: window.location.origin + '/'
}).then(authenticated => {
  if (authenticated) {
    console.log('User is authenticated');

    // Store token for API calls
    localStorage.setItem('kc_token', keycloak.token || '');
    localStorage.setItem('kc_refreshToken', keycloak.refreshToken || '');

    // Render app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Auto-refresh token
    setInterval(() => {
      keycloak.updateToken(70).then(refreshed => {
        if (refreshed) {
          console.log('Token refreshed');
          localStorage.setItem('kc_token', keycloak.token || '');
        }
      }).catch(() => {
        console.log('Failed to refresh token');
        keycloak.login();
      });
    }, 60000);
  } else {
    console.log('User is not authenticated');
    keycloak.login();
  }
}).catch(err => {
  console.error('Failed to initialize Keycloak', err);
});

// Export keycloak instance for use in components
export { keycloak };
```

#### Create Auth Context for React Components

**apps/mail/src/contexts/AuthContext.tsx:**
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../keycloak';

interface User {
  email?: string;
  name?: string;
  username?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  logout: () => void;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (keycloak.authenticated) {
      setIsAuthenticated(true);
      setUser({
        email: keycloak.tokenParsed?.email,
        name: keycloak.tokenParsed?.name,
        username: keycloak.tokenParsed?.preferred_username,
        roles: keycloak.tokenParsed?.realm_access?.roles || []
      });
    }
  }, []);

  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
  };

  const getToken = () => {
    return keycloak.token;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### Update App Component

**apps/mail/src/App.tsx:**
```typescript
import { AuthProvider, useAuth } from './contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <h1>Darevel Mail</h1>
        <div>
          Welcome, {user?.email}
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      {/* Rest of your app */}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
```

### Step 4: Implement SSO for Next.js Apps

#### Install Dependencies

```bash
cd apps/auth
npm install next-auth@beta @auth/core ioredis

cd ../suite
npm install next-auth@beta @auth/core

cd ../slides
npm install next-auth@beta @auth/core

cd ../drive
npm install next-auth@beta @auth/core

cd ../notify
npm install next-auth@beta @auth/core
```

#### Configure Auth App (Central SSO)

**apps/auth/app/api/auth/[...nextauth]/route.ts:**
```typescript
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

**apps/auth/.env.local:**
```env
NEXTAUTH_URL=http://auth.darevel.local:3005
NEXTAUTH_SECRET=darevel-sso-secret-change-in-production
KEYCLOAK_CLIENT_ID=darevel-suite
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

#### Configure Other Next.js Apps

Each Next.js app needs similar setup pointing to the central auth service.

**apps/suite/.env.local:**
```env
NEXTAUTH_URL=http://suite.darevel.local:3000
NEXTAUTH_SECRET=darevel-sso-secret-change-in-production
KEYCLOAK_CLIENT_ID=darevel-suite
KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
```

**Repeat for slides, drive, notify with their respective client IDs.**

### Step 5: Update Vite Config for Local Domains

**apps/mail/vite.config.ts:**
```typescript
export default defineConfig({
  server: {
    port: 3003,
    host: '0.0.0.0', // Listen on all interfaces
    strictPort: true
  },
  // ... rest of config
});
```

**Repeat for chat (3002) and excel (3004).**

### Step 6: Test SSO Flow

**1. Start everything:**
```bash
npm run dev
```

**2. Test Mail app:**
- Visit: http://mail.darevel.local:3003
- Should redirect to Keycloak
- Login with demo@darevel.com / demo123
- Redirected back to Mail app
- **You're logged in!**

**3. Test Chat app (no re-login):**
- Visit: http://chat.darevel.local:3002
- Should automatically log in (SSO!)
- No password prompt

**4. Test all other apps:**
- All should work with single login session

### Step 7: Add Logout Across All Apps

When user logs out from one app, log out from all.

**Keycloak handles this automatically** if you use proper logout:

```typescript
// Vite apps
keycloak.logout({
  redirectUri: 'http://suite.darevel.local:3000'
});

// Next.js apps
import { signOut } from 'next-auth/react';
signOut({ callbackUrl: '/' });
```

## Testing Checklist

- [ ] All domains resolve to 127.0.0.1
- [ ] Keycloak realm updated with new redirect URIs
- [ ] All Vite apps have keycloak-js installed
- [ ] All Next.js apps have next-auth installed
- [ ] Login from Mail app works
- [ ] Navigate to Chat app without re-login (SSO working)
- [ ] Navigate to Excel app without re-login
- [ ] Navigate to Slides app without re-login
- [ ] Navigate to Suite app without re-login
- [ ] Logout from one app logs out from all

## Production Considerations

### Use Real Domains

Replace `darevel.local` with real domains:
- auth.darevel.com
- mail.darevel.com
- chat.darevel.com
- etc.

### HTTPS Required

Keycloak requires HTTPS in production:

```env
KEYCLOAK_ISSUER=https://auth.darevel.com/realms/pilot180
```

### Secure Cookies

```typescript
{
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // HTTPS only
        domain: '.darevel.com' // Share across subdomains
      }
    }
  }
}
```

### Redis for Shared Sessions

Install Redis adapter for NextAuth:

```bash
npm install @auth/redis-adapter ioredis
```

**apps/auth/app/api/auth/[...nextauth]/route.ts:**
```typescript
import { RedisAdapter } from "@auth/redis-adapter";
import Redis from "ioredis";

const redis = new Redis("redis://localhost:6379");

const handler = NextAuth({
  adapter: RedisAdapter(redis),
  // ... rest of config
});
```

This ensures all Next.js apps share the same session via Redis.

## Troubleshooting

### Domain not resolving

**Check hosts file:**
```bash
# Windows
type C:\Windows\System32\drivers\etc\hosts

# Linux/Mac
cat /etc/hosts
```

**Clear DNS cache:**
```bash
# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches

# Mac
sudo dscacheutil -flushcache
```

### Redirect URI mismatch

**Error:**
```
Invalid redirect URI
```

**Solution:**
1. Check Keycloak admin console
2. Ensure redirect URIs include the exact URL
3. Update realm-export.json
4. Restart: `npm run clean && npm run dev`

### CORS errors

**Add to Keycloak client:**
```json
{
  "webOrigins": ["+"]
}
```

This allows all origins (dev only!).

### Token expired

Keycloak tokens expire. Implement auto-refresh:

```typescript
setInterval(() => {
  keycloak.updateToken(70).then(refreshed => {
    if (refreshed) {
      console.log('Token refreshed');
    }
  });
}, 60000);
```

## Next Steps

1. **Implement this guide step by step**
2. **Test SSO flow across all apps**
3. **Add user profile page** showing session info
4. **Implement role-based access control** (admin vs user)
5. **Add session management dashboard** (see all active sessions)

## Resources

- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Keycloak SSO Guide](https://www.keycloak.org/docs/latest/securing_apps/)

---

**Summary:**

This guide provides a complete implementation path for Google Workspace-style SSO across all Darevel apps. The key is using Keycloak as the identity provider, with keycloak-js for Vite apps and NextAuth.js for Next.js apps, all sharing session state for true single sign-on.
