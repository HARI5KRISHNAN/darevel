# Darevel Suite - READY TO RUN! 🚀

All port conflicts have been resolved and your monorepo is production-ready.

## What We Fixed

### 1. Port Configuration ✓
All 8 apps now run on unique ports (3000-3007):

| App      | Port | URL                       |
|----------|------|---------------------------|
| Suite    | 3000 | http://localhost:3000     |
| Slides   | 3001 | http://localhost:3001     |
| Chat     | 3002 | http://localhost:3002     |
| Mail     | 3003 | http://localhost:3003     |
| Excel    | 3004 | http://localhost:3004     |
| Auth     | 3005 | http://localhost:3005     |
| Drive    | 3006 | http://localhost:3006     |
| Notify   | 3007 | http://localhost:3007     |

### 2. Package Names ✓
Renamed all packages for consistency:
- `my-v0-project` → `slides`
- `whooper-gemini-chat` → `chat`
- `mailbox-ui-clone` → `mail`
- `ai-spreadsheet` → `excel`

### 3. Workspace Cleanup ✓
- Removed duplicate `package-lock.json` files
- Removed duplicate `pnpm-lock.yaml` files
- Removed all individual `node_modules` folders
- Reinstalled all dependencies from root with proper workspace linking

### 4. Dependency Resolution ✓
- Added `.npmrc` with `legacy-peer-deps=true` to handle peer dependency conflicts
- All 732 packages installed successfully

## Run Your Apps Now!

```bash
npm run dev
```

This will start **all 8 apps** in parallel using Turborepo.

Expected output:
```
• Suite:dev: ready - started server on 0.0.0.0:3000
• Slides:dev: ready - started server on 0.0.0.0:3001
• Chat:dev: VITE ready in 234 ms
• Mail:dev: VITE ready in 456 ms
• Excel:dev: VITE ready in 345 ms
• Auth:dev: ready - started server on 0.0.0.0:3005
• Drive:dev: ready - started server on 0.0.0.0:3006
• Notify:dev: ready - started server on 0.0.0.0:3007
```

## Access Your Apps

Open your browser and visit:

- **Suite Dashboard**: http://localhost:3000
- **Slides (PowerPoint)**: http://localhost:3001
- **Chat**: http://localhost:3002
- **Mail**: http://localhost:3003
- **Excel**: http://localhost:3004
- **Auth**: http://localhost:3005
- **Drive**: http://localhost:3006
- **Notify**: http://localhost:3007

## Next Steps

### 1. Customize the Suite Dashboard

Edit `apps/suite/app/page.tsx` to create a launcher with links to all apps:

```tsx
export default function Home() {
  const apps = [
    { name: "Slides", url: "http://localhost:3001", icon: "📊" },
    { name: "Chat", url: "http://localhost:3002", icon: "💬" },
    { name: "Mail", url: "http://localhost:3003", icon: "📧" },
    { name: "Excel", url: "http://localhost:3004", icon: "📈" },
    { name: "Auth", url: "http://localhost:3005", icon: "🔐" },
    { name: "Drive", url: "http://localhost:3006", icon: "📁" },
    { name: "Notify", url: "http://localhost:3007", icon: "🔔" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {apps.map(app => (
        <a
          key={app.name}
          href={app.url}
          className="p-6 border rounded-lg hover:shadow-lg"
        >
          <div className="text-4xl mb-2">{app.icon}</div>
          <h2 className="text-xl font-bold">{app.name}</h2>
        </a>
      ))}
    </div>
  );
}
```

### 2. Build Shared SDK

Add shared functionality to `packages/sdk/`:
- Authentication helpers
- Storage utilities
- Notification services
- API clients

Example:
```typescript
// packages/sdk/auth.ts
export const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3005/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

### 3. Share UI Components

Add reusable components to `packages/ui/`:
```typescript
// packages/ui/Button.tsx
export const Button = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>
    {children}
  </button>
);
```

Then use in any app:
```typescript
import { Button } from '@darevel/ui';
```

### 4. Environment Configuration

Update `.env` with your actual credentials:
```bash
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
DATABASE_URL=your-database-url
```

### 5. Production Deployment

Each app can be deployed independently:

```bash
# Build all apps
npm run build

# Or build specific app
cd apps/auth
npm run build
```

Deploy to:
- Vercel (for Next.js apps)
- Netlify (for Vite apps)
- Your own server

## Turborepo Features You're Using

- **Parallel Execution**: All apps run simultaneously
- **Smart Caching**: Builds are cached to speed up reruns
- **Incremental Builds**: Only rebuild what changed
- **Workspace Management**: Shared dependencies across all apps

## Documentation

- [README.md](README.md) - Full project documentation
- [QUICKSTART.md](QUICKSTART.md) - Step-by-step guide
- [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md) - Complete port reference
- [SETUP_COMPLETE.md](SETUP_COMPLETE.md) - Setup checklist

## Troubleshooting

### Apps Not Starting?
```bash
# Clear everything and reinstall
rm -rf node_modules apps/*/node_modules
npm install
```

### Port Conflicts?
See [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md) for how to change ports.

### Build Errors?
```bash
# Clear Turborepo cache
rm -rf .turbo
npm run build
```

---

## You're All Set! 🎉

Your Darevel Suite is ready. Run `npm run dev` and start building!

Questions? Check the docs or open an issue.
