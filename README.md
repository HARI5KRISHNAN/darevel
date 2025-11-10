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

- **Suite** (`apps/suite`) - Main dashboard for accessing all apps (Port 3000)
- **Slides** (`apps/slides`) - Presentation software (Port 3001)
- **Chat** (`apps/chat`) - Real-time messaging with AI (Port 3002)
- **Mail** (`apps/mail`) - Email client (Port 3003)
- **Excel** (`apps/excel`) - AI-powered spreadsheet (Port 3004)
- **Auth** (`apps/auth`) - Authentication service (Port 3005)
- **Drive** (`apps/drive`) - Cloud storage (Port 3006)
- **Notify** (`apps/notify`) - Real-time notifications (Port 3007)

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm, yarn, or pnpm
- Docker Desktop (for backend services)

### Installation

```bash
# Install dependencies
npm install
```

### Start Development Environment

**One command to start everything:**

```bash
npm run dev
```

This automatically:
1. Starts Docker services (PostgreSQL, Keycloak, Redis)
2. Waits for all services to be ready
3. Starts all 8 apps with Turborepo

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker documentation.

### Quick Commands

```bash
npm run dev        # Start everything (Docker + apps)
npm run dev:apps   # Start only apps (Docker must be running)
npm run dev:docker # Start only Docker services
npm run stop       # Stop all Docker services
npm run build      # Build all apps
```

See [COMMANDS.md](COMMANDS.md) for complete command reference.

### Individual App Development

Each app runs on its own port:

- Suite: http://localhost:3000
- Slides: http://localhost:3001
- Chat: http://localhost:3002
- Mail: http://localhost:3003
- Excel: http://localhost:3004
- Auth: http://localhost:3005
- Drive: http://localhost:3006
- Notify: http://localhost:3007

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
