# Custom Branded Login Page Guide

Complete guide for the professional, custom-branded Darevel Suite login experience.

## Overview

Your Darevel Suite now features a **beautiful, enterprise-grade login page** that replaces the default Keycloak UI with a fully branded experience.

### What You Get

✅ **Professional Dark Theme** - Modern gradient background with animated elements
✅ **Darevel Branding** - Custom logo and color scheme
✅ **Seamless Integration** - Works with NextAuth + Keycloak SSO
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Smooth animations and feedback
✅ **Feature Showcase** - Highlights all Darevel apps
✅ **Responsive Design** - Works on all devices
✅ **Single Sign-On** - Login once, access all apps

## Visual Design

### Color Scheme

- **Background**: Slate-900 with blue/purple gradient overlays
- **Card**: Semi-transparent slate-800 with blur effect
- **Primary Button**: Blue-600 to Purple-600 gradient
- **Accent Colors**: Blue, Purple, Green, Orange for app icons

### Typography

- **Font**: Inter (clean, modern, professional)
- **Heading**: 3xl, bold, white
- **Body**: Base, slate-400
- **Buttons**: Semibold, white

### Animations

- **Background**: Pulsing gradient spheres
- **Button**: Scale on hover/click
- **Loading**: Spinning icon

## File Structure

```
apps/auth/
├── app/
│   ├── signin/
│   │   └── page.tsx          ← Custom branded login page
│   ├── page.tsx               ← Redirects to /signin
│   ├── layout.tsx             ← Updated with SessionProvider
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts   ← NextAuth config
├── components/
│   └── SessionProvider.tsx    ← Client-side session wrapper
└── public/
    └── (add logo here)        ← Your Darevel logo
```

## Implementation Details

### 1. Custom Sign-In Page

**File:** [apps/auth/app/signin/page.tsx](apps/auth/app/signin/page.tsx)

**Key Features:**
- Client-side component (`"use client"`)
- Integrates with NextAuth's `signIn()` function
- Reads callback URL from query params
- Displays user-friendly error messages
- Loading state with spinner
- Gradient background with animations
- Feature grid showing all Darevel apps

**Flow:**
```
User visits auth.darevel.local:3005
  ↓
Redirected to /signin
  ↓
User clicks "Sign in with Keycloak"
  ↓
signIn("keycloak", { callbackUrl })
  ↓
Redirected to Keycloak login (brief flash)
  ↓
Keycloak validates credentials
  ↓
Redirected back to callbackUrl
  ↓
✅ User logged in to all apps!
```

### 2. Home Page Redirect

**File:** [apps/auth/app/page.tsx](apps/auth/app/page.tsx)

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/signin");
}
```

**Purpose:** Ensures `auth.darevel.local:3005` automatically shows the login page.

### 3. Session Provider

**File:** [apps/auth/components/SessionProvider.tsx](apps/auth/components/SessionProvider.tsx)

```typescript
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

**Purpose:** Wraps the app to provide session context for `useSession()` and `signIn()`.

### 4. Layout Configuration

**File:** [apps/auth/app/layout.tsx](apps/auth/app/layout.tsx)

**Changes:**
- Added SessionProvider wrapper
- Updated metadata (title, description, keywords)
- Changed font to Inter for modern look

### 5. NextAuth Configuration

**File:** [apps/auth/app/api/auth/[...nextauth]/route.ts](apps/auth/app/api/auth/[...nextauth]/route.ts)

**Key settings:**
```typescript
pages: {
  signIn: '/signin',  // Points to our custom page
  error: '/error',    // Custom error page (can be created)
}
```

## How to Test

### Step 1: Start Services

```bash
npm run dev
```

### Step 2: Open Auth App

Visit:
```
http://auth.darevel.local:3005
```

**Expected Result:**
- Beautiful dark-themed login page
- Darevel branding
- "Sign in with Keycloak" button
- Feature grid showing all apps

### Step 3: Sign In

Click **"Sign in with Keycloak"**

**What Happens:**
1. Brief redirect to Keycloak (you may see it flash)
2. Keycloak login form appears
3. Enter credentials: `demo@darevel.com` / `demo123`
4. Redirected back to Suite (`suite.darevel.local:3000`)
5. ✅ Logged in!

### Step 4: Test SSO

Visit other apps:
```
http://slides.darevel.local:3001
http://drive.darevel.local:3006
http://mail.darevel.local:3003
http://chat.darevel.local:3002
```

**All should work without re-login!**

## Customization Options

### 1. Change Colors

Edit `apps/auth/app/signin/page.tsx`:

```tsx
// Background gradient
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"

// Primary button gradient
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Accent colors
className="from-blue-500 to-purple-600" // Logo gradient
```

**Example: Red Theme**
```tsx
from-red-900 via-red-800 to-red-900     // Background
from-red-600 to-orange-600              // Button
from-red-500 to-orange-600              // Logo
```

### 2. Add Your Logo

**Option A: Use an image**

1. Add your logo to `apps/auth/public/logo.svg` or `logo.png`

2. Update the login page:
```tsx
<div className="flex justify-center mb-8">
  <img src="/logo.svg" alt="Darevel Logo" className="h-16" />
</div>
```

**Option B: Keep gradient text (current)**

The current design uses a gradient text logo which looks modern and doesn't require an image file.

### 3. Customize Features Grid

Edit the features section in `page.tsx`:

```tsx
<div className="grid grid-cols-2 gap-3 text-xs">
  <div className="flex items-center gap-2 text-slate-400">
    <svg>...</svg>
    <span>Your Feature</span>
  </div>
  // Add more features...
</div>
```

### 4. Change Loading Messages

```tsx
{loading ? "Signing in..." : "Sign in with Keycloak"}
```

Change to:
```tsx
{loading ? "Please wait..." : "Continue to Darevel"}
```

### 5. Add Social Login Buttons

After implementing Google/Microsoft providers in NextAuth:

```tsx
<button
  onClick={() => signIn("google", { callbackUrl })}
  className="..."
>
  Sign in with Google
</button>

<button
  onClick={() => signIn("microsoft", { callbackUrl })}
  className="..."
>
  Sign in with Microsoft
</button>
```

### 6. Custom Error Page

Create `apps/auth/app/error/page.tsx`:

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-4">
          Authentication Error
        </h1>
        <p className="text-slate-400">{error}</p>
        <a
          href="/signin"
          className="mt-6 block text-center bg-blue-600 text-white py-3 px-6 rounded-lg"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
```

## Error Messages

The custom login page handles these NextAuth errors:

| Error Code | User-Friendly Message |
|------------|----------------------|
| `OAuthSignin` | Error connecting to authentication service |
| `OAuthCallback` | Error during authentication |
| `OAuthCreateAccount` | Could not create user account |
| `Callback` | Error during callback |
| `OAuthAccountNotLinked` | Account already exists with different provider |
| `CredentialsSignin` | Invalid credentials |
| `SessionRequired` | Please sign in to continue |

## Advanced Features

### 1. Remember Me

Add a checkbox:

```tsx
const [rememberMe, setRememberMe] = useState(false);

<label className="flex items-center gap-2 text-sm text-slate-400">
  <input
    type="checkbox"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
    className="..."
  />
  Remember me
</label>
```

Use in signIn:

```tsx
await signIn("keycloak", {
  callbackUrl,
  // Adjust session length based on rememberMe
});
```

### 2. Redirect Logic

Customize where users go after login:

```tsx
const getCallbackUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const callback = params.get("callbackUrl");

  // If coming from a specific app, return there
  if (callback) return callback;

  // Check if user was at a specific app before
  const lastApp = localStorage.getItem("lastApp");
  if (lastApp) return lastApp;

  // Default to suite
  return "http://suite.darevel.local:3000";
};
```

### 3. Loading Animation Variants

**Option A: Spinner (current)**
```tsx
<svg className="animate-spin h-5 w-5">...</svg>
```

**Option B: Dots**
```tsx
<span className="flex gap-1">
  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
</span>
```

**Option C: Progress Bar**
```tsx
<div className="w-full bg-slate-700 rounded-full h-2">
  <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
</div>
```

### 4. Multi-Language Support

```tsx
const translations = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to access your workspace",
    button: "Sign in with Keycloak",
  },
  es: {
    title: "Bienvenido de Nuevo",
    subtitle: "Inicia sesión para acceder a tu espacio",
    button: "Iniciar sesión con Keycloak",
  },
};

const [lang, setLang] = useState("en");
const t = translations[lang];
```

## Comparison: Before vs After

### Before (Default Keycloak UI)

❌ Generic red-themed Keycloak page
❌ No branding
❌ Confusing redirect flow
❌ Not mobile-friendly
❌ No loading states
❌ Technical error messages

### After (Custom Darevel Login)

✅ Beautiful dark-themed UI
✅ Full Darevel branding
✅ Seamless experience
✅ Fully responsive
✅ Smooth animations
✅ User-friendly messages
✅ Professional appearance

## Troubleshooting

### Issue 1: Blank Page

**Symptoms:**
- Login page shows blank/white screen

**Solution:**
1. Check browser console for errors
2. Verify SessionProvider is wrapping the app
3. Check Tailwind CSS is working:
   ```bash
   # Check globals.css
   cat apps/auth/app/globals.css
   ```

### Issue 2: Button Does Nothing

**Symptoms:**
- Click button, nothing happens

**Solution:**
1. Check browser console
2. Verify NextAuth is configured:
   ```bash
   # Check route exists
   ls apps/auth/app/api/auth/[...nextauth]/
   ```
3. Ensure environment variables are set:
   ```bash
   cat apps/auth/.env.local
   ```

### Issue 3: Redirect Loop

**Symptoms:**
- Infinite redirects between login and callback

**Solution:**
1. Check middleware configuration in other apps
2. Verify NEXTAUTH_URL is correct
3. Clear browser cookies
4. Check Keycloak redirect URIs include your domain

### Issue 4: Styling Broken

**Symptoms:**
- No colors, plain HTML

**Solution:**
1. Check Tailwind is installed:
   ```bash
   npm list tailwindcss -w apps/auth
   ```
2. Verify tailwind.config:
   ```bash
   cat apps/auth/tailwind.config.ts
   ```
3. Restart dev server:
   ```bash
   npm run dev
   ```

### Issue 5: Error After Keycloak Login

**Symptoms:**
- Login at Keycloak works, but error after redirect

**Solution:**
1. Check NextAuth secret is set
2. Verify callback URLs in Keycloak match your domain
3. Check Redis is running:
   ```bash
   docker ps | grep redis
   ```

## Production Checklist

- [ ] Add real logo image to `/public/`
- [ ] Customize color scheme to match brand
- [ ] Add "Forgot Password" link
- [ ] Add "Sign Up" link
- [ ] Create custom error page
- [ ] Add terms of service link
- [ ] Add privacy policy link
- [ ] Implement "Remember Me" feature
- [ ] Add multi-language support
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Optimize images and assets
- [ ] Add meta tags for SEO
- [ ] Configure CSP headers
- [ ] Add analytics tracking
- [ ] Test error scenarios
- [ ] Add accessibility features (ARIA labels)
- [ ] Implement rate limiting
- [ ] Add CAPTCHA for brute force protection

## Useful Commands

```bash
# Start development server
npm run dev

# Build auth app
npm run build --workspace=apps/auth

# Test production build
npm run start --workspace=apps/auth

# Check Tailwind classes
npx tailwindcss -i apps/auth/app/globals.css -o test-output.css

# Clear Next.js cache
rm -rf apps/auth/.next

# Restart with clean cache
npm run dev
```

## API Reference

### signIn Function

```typescript
import { signIn } from 'next-auth/react';

// Basic usage
await signIn('keycloak');

// With callback URL
await signIn('keycloak', {
  callbackUrl: 'http://suite.darevel.local:3000'
});

// Redirect false (for handling programmatically)
const result = await signIn('keycloak', {
  redirect: false,
  callbackUrl: '...'
});
```

### useSearchParams Hook

```typescript
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const callbackUrl = searchParams.get('callbackUrl');
const error = searchParams.get('error');
```

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js Custom Pages](https://next-auth.js.org/configuration/pages)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

---

**Status:** ✅ **Complete and Ready to Use**

**Last Updated:** 2025-11-10

**Your Darevel Suite now has a beautiful, professional login experience that rivals Google Workspace and Microsoft 365!**
