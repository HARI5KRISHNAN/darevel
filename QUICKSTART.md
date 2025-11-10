# Quick Start Guide - Darevel Suite

## Step 1: Verify Installation

You should already have the monorepo set up. Verify by running:

```bash
ls apps/
# Should show: auth, drive, notify, suite

ls packages/
# Should show: config, sdk, ui
```

## Step 2: Configure Each App for Different Ports

Each app needs to run on a different port. Let's configure them:

### Auth App (Port 3005)

Edit `apps/auth/package.json`:

```json
"scripts": {
  "dev": "next dev -p 3005",
  "build": "next build",
  "start": "next start -p 3005"
}
```

### Drive App (Port 3006)

Edit `apps/drive/package.json`:

```json
"scripts": {
  "dev": "next dev -p 3006",
  "build": "next build",
  "start": "next start -p 3006"
}
```

### Notify App (Port 3007)

Edit `apps/notify/package.json`:

```json
"scripts": {
  "dev": "next dev -p 3007",
  "build": "next build",
  "start": "next start -p 3007"
}
```

### Suite App (Port 3000)

Edit `apps/suite/package.json`:

```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000"
}
```

## Step 3: Run All Apps

From the root directory:

```bash
npm run dev
```

This will start all 4 apps in parallel:

- Suite: http://localhost:3000
- Auth: http://localhost:3005
- Drive: http://localhost:3006
- Notify: http://localhost:3007

## Step 4: Open VS Code Workspace

```bash
code DarevelSuite.code-workspace
```

This opens all apps and packages in a single VS Code window.

## Next Steps

### Add Your Existing Apps

If you have existing Chat, Mail, Excel, and Slides apps:

```bash
# Move them to the apps folder
mv ~/path/to/chat apps/chat
mv ~/path/to/mail apps/mail
mv ~/path/to/excel apps/excel
mv ~/path/to/slides apps/slides
```

Then configure their ports in their respective `package.json` files:
- Chat: Port 3001
- Mail: Port 3002
- Excel: Port 3003
- Slides: Port 3004

### Customize the Suite Dashboard

Edit `apps/suite/app/page.tsx` to create a dashboard with links to all your apps:

```tsx
export default function Home() {
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      <AppCard name="Chat" url="http://localhost:3001" />
      <AppCard name="Mail" url="http://localhost:3002" />
      <AppCard name="Excel" url="http://localhost:3003" />
      <AppCard name="Slides" url="http://localhost:3004" />
      <AppCard name="Auth" url="http://localhost:3005" />
      <AppCard name="Drive" url="http://localhost:3006" />
      <AppCard name="Notify" url="http://localhost:3007" />
    </div>
  );
}
```

## Troubleshooting

### Port Already in Use

If a port is already in use, change it in the app's `package.json` file.

### Module Not Found

Run `npm install` from the root directory.

### Turbo Not Found

Reinstall Turborepo:

```bash
npm install turbo -D
```

## Development Tips

1. **Hot Reload**: Changes to shared packages automatically rebuild dependent apps
2. **Parallel Builds**: Turborepo runs builds in parallel for speed
3. **Caching**: Turborepo caches builds to avoid redundant work
4. **Workspace**: Use the VS Code workspace for better organization

Enjoy building with Darevel Suite!
