# Darevel Suite - Port Configuration

All apps in the Darevel monorepo run on unique ports to avoid conflicts.

## Port Assignments

| App Name | Folder           | Port | URL                       | Technology |
|----------|------------------|------|---------------------------|------------|
| Suite    | `apps/suite`     | 3000 | http://localhost:3000     | Next.js    |
| Slides   | `apps/slides`    | 3001 | http://localhost:3001     | Next.js    |
| Chat     | `apps/chat`      | 3002 | http://localhost:3002     | Vite       |
| Mail     | `apps/mail`      | 3003 | http://localhost:3003     | Vite       |
| Excel    | `apps/excel`     | 3004 | http://localhost:3004     | Vite       |
| Auth     | `apps/auth`      | 3005 | http://localhost:3005     | Next.js    |
| Drive    | `apps/drive`     | 3006 | http://localhost:3006     | Next.js    |
| Notify   | `apps/notify`    | 3007 | http://localhost:3007     | Next.js    |

## Running Apps

### Start All Apps
```bash
npm run dev
```

This will start all 8 apps simultaneously using Turborepo.

### Start Individual App
```bash
cd apps/suite
npm run dev
```

## Technology Stack

### Next.js Apps (5)
- Suite, Slides, Auth, Drive, Notify
- Use `next dev -p PORT` for development
- Port configured in `package.json` scripts

### Vite Apps (3)
- Chat, Mail, Excel
- Use `vite --port PORT` for development
- Port configured in `package.json` scripts

## App Descriptions

### Suite (Port 3000)
Main dashboard that provides access to all Darevel applications. This is your entry point.

### Slides (Port 3001)
PowerPoint/Presentation clone with AI features for creating and editing presentations.

### Chat (Port 3002)
Real-time messaging application with Gemini AI integration.

### Mail (Port 3003)
Email client with AI-powered features for managing emails.

### Excel (Port 3004)
Spreadsheet application with AI capabilities for data analysis and formula generation.

### Auth (Port 3005)
Authentication and authorization service for all Darevel apps. Handles login, SSO, and user management.

### Drive (Port 3006)
Cloud storage and file management service. Stores files for all applications.

### Notify (Port 3007)
Real-time notification service. Sends updates and alerts across all apps.

## Production Ports

In production, these apps will be deployed on subdomains:
- https://suite.darevel.com
- https://slides.darevel.com
- https://chat.darevel.com
- https://mail.darevel.com
- https://excel.darevel.com
- https://auth.darevel.com
- https://drive.darevel.com
- https://notify.darevel.com

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

1. Check what's running on that port:
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -i :3000
   ```

2. Kill the process or change the port in the app's `package.json`

### Can't Access App
1. Verify the app is running: `npm run dev` should show all active apps
2. Check the console for errors
3. Ensure the port matches what's configured in `package.json`

## Modifying Ports

To change an app's port:

1. Open the app's `package.json`
2. Find the `dev` script
3. Change the port number:
   - Next.js: `"dev": "next dev -p XXXX"`
   - Vite: `"dev": "vite --port XXXX"`
4. Update this document
5. Restart the app

## Notes

- All ports are configured to avoid conflicts
- Turborepo runs all apps in parallel
- Each app can be run independently
- Port 3000 is reserved for the main Suite dashboard
