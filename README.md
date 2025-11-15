# Darevel Suite - Monorepo

A modern, scalable monorepo containing all Darevel applications built with Next.js 16, TypeScript, and Turborepo.

## Architecture

```
darevel-suite/
├── apps/                    # All Next.js applications
│   ├── auth/               # Authentication service
│   ├── drive/              # File storage service
│   ├── notify/             # Notification service
│   └── suite/              # Main suite dashboard
├── packages/               # Shared packages
│   ├── sdk/                # Shared SDK & utilities
│   ├── ui/                 # Shared UI components
│   └── config/             # Shared configuration
└── turbo.json              # Turborepo configuration
```

## Apps (8/8 Complete)

- **Slides** (`apps/slides`) - Presentation software (Port 3000)
- **Suite** (`apps/suite`) - Main dashboard for accessing all apps (Port 3002)
- **Chat** (`apps/chat`) - Real-time messaging with AI (Port 3003)
- **Excel** (`apps/excel`) - AI-powered spreadsheet (Port 3004)
- **Auth** (`apps/auth`) - Authentication service with Keycloak SSO (Port 3005)
- **Drive** (`apps/drive`) - Cloud storage (Port 3006)
- **Notify** (`apps/notify`) - Real-time notifications (Port 3007)
- **Mail** (`apps/mail`) - Email client (Port 3008)

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm, yarn, or pnpm
- Docker Desktop (for backend services)

### One-Command Setup ⚡

Clone the repo and run just **one command** to set everything up:

```bash
# 1. Install dependencies
npm install

# 2. Run automated setup (first time only)
npm run setup
```

The `setup` script will automatically:
- ✅ Check if Docker is running (and start it if needed)
- ✅ Start all backend services (PostgreSQL, Keycloak, Redis)
- ✅ Wait for services to be ready
- ✅ Generate secure secrets (NEXTAUTH_SECRET, etc.)
- ✅ Create `.env.local` files for all 8 apps
- ✅ Configure Keycloak client with proper OAuth settings
- ✅ Sync authentication config across all apps

After setup completes, start development with:

```bash
npm run dev
```

This will start all 8 frontend apps simultaneously!

### Quick Commands

```bash
npm run setup      # One-time automated setup (Docker + Keycloak + env files)
npm run dev        # Start all 8 apps in development mode
npm run dev:apps   # Start only apps (Docker must be running)
npm run dev:docker # Start only Docker services
npm run stop       # Stop all Docker services
npm run clean      # Stop and remove all Docker volumes
npm run build      # Build all apps
npm run killports  # Kill processes on app ports (3000-3008)
```

### Backend Services

After running `npm run setup`, these services will be available:

- 🧠 **Keycloak** - http://localhost:8080 (admin/admin)
- 🗃️ **PostgreSQL** - localhost:5433
- ⚡ **Redis** - localhost:6379
- 🌐 **API Gateway** - http://localhost:8081

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker documentation.

### Individual App Development

Each app runs on its own port:

- Slides: http://localhost:3000
- Suite: http://localhost:3002
- Chat: http://localhost:3003
- Excel: http://localhost:3004
- Auth: http://localhost:3005
- Drive: http://localhost:3006
- Notify: http://localhost:3007
- Mail: http://localhost:3008

To run a specific app:

```bash
cd apps/auth
npm run dev
```

## Environment Variables

Copy [.env.example](.env.example) to `.env` and configure:

```bash
cp .env.example .env
```

Key environment variables:
- `NEXTAUTH_URL` - Auth service URL
- `STORAGE_URL` - Drive service URL
- `NOTIFY_URL` - Notification service URL
- `JWT_SECRET` - JWT signing secret

## Workspace Management

Open the workspace in VS Code:

```bash
code DarevelSuite.code-workspace
```

This will open all apps and packages in a single VS Code window with proper configuration.

## Shared Packages

### @darevel/sdk
Shared utilities for Auth, Storage, and Notifications

```typescript
import { authHelpers, storageHelpers, notifyHelpers } from '@darevel/sdk';
```

### @darevel/ui
Shared UI components

```typescript
import { Button, Card } from '@darevel/ui';
```

### @darevel/config
Shared configuration and constants

```typescript
import { config } from '@darevel/config';
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces

## Development Workflow

1. Make changes in any app or package
2. Run `npm run dev` from root to start all apps
3. Turborepo will handle dependencies and caching
4. Changes to shared packages automatically rebuild dependent apps

## Production Deployment

Each app can be deployed independently:

```bash
# Build all apps
npm run build

# Or build specific app
cd apps/auth
npm run build
```

## Contributing

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - Darevel Suite
# darevel
