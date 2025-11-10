# Fixing Port Conflicts - Darevel Suite

## Problem: "Address Already in Use" Error

If you see this error when running `npm run dev`:

```
Error: listen EADDRINUSE: address already in use :::3001
```

This means a port is already occupied by another process.

## Quick Fix Options

### Option 1: Use the Cleanup Script (Recommended)

We've created scripts to automatically clean up all Darevel ports:

**PowerShell:**
```powershell
.\kill-ports.ps1
```

**Git Bash:**
```bash
./kill-ports.sh
```

Then run:
```bash
npm run dev
```

### Option 2: Manual Cleanup

#### Windows (PowerShell/CMD)

1. Find the process using the port:
   ```bash
   netstat -ano | findstr :3001
   ```

2. You'll see output like:
   ```
   TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    13736
   ```

3. Kill the process (note the PID from the last column):
   ```bash
   taskkill /PID 13736 /F
   ```

#### Git Bash (Windows)

Use double slashes for taskkill:
```bash
taskkill //PID 13736 //F
```

#### Linux/Mac

1. Find the process:
   ```bash
   lsof -i :3001
   ```

2. Kill it:
   ```bash
   kill -9 <PID>
   ```

### Option 3: Change the Port

If you don't want to kill processes, change the app's port:

1. Open the app's `package.json` (e.g., `apps/slides/package.json`)
2. Change the dev script:
   ```json
   "scripts": {
     "dev": "next dev -p 3010"
   }
   ```
3. Run `npm run dev`

Don't forget to update [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md)!

## Common Causes

1. **Previous crash**: App crashed but process still running
2. **Multiple terminal sessions**: Running `npm run dev` in multiple terminals
3. **Other apps**: Different application using the same port
4. **Background services**: System service on that port

## Prevention Tips

### Always Stop Gracefully

When stopping your apps:
- Use `Ctrl+C` in the terminal (not just closing the window)
- Wait for all processes to terminate
- If using VS Code, use the "Kill Terminal" option

### Check Before Starting

Before running `npm run dev`, check if ports are free:

**Windows:**
```bash
netstat -ano | findstr :300
```

**Linux/Mac:**
```bash
lsof -i :3000-3007
```

### Use the Cleanup Script

Make it a habit to run the cleanup script before starting:
```bash
./kill-ports.sh && npm run dev
```

## All Darevel Ports

| App    | Port |
|--------|------|
| Suite  | 3000 |
| Slides | 3001 |
| Chat   | 3002 |
| Mail   | 3003 |
| Excel  | 3004 |
| Auth   | 3005 |
| Drive  | 3006 |
| Notify | 3007 |

## Troubleshooting

### "Access Denied" when killing process

Run your terminal as Administrator:
- **PowerShell**: Right-click → "Run as Administrator"
- **CMD**: Right-click → "Run as Administrator"

### Process keeps coming back

Check Task Manager for:
- Node.js processes
- Next.js processes
- Vite processes

Kill them manually from Task Manager.

### Port still in use after cleanup

1. Restart your computer (nuclear option)
2. Or change the port to something else (3010-3020 range)

## Need Help?

If port conflicts persist:
1. Check [CURRENT_STATUS.md](CURRENT_STATUS.md) for app status
2. See [README.md](README.md) for general troubleshooting
3. Run the cleanup script: `./kill-ports.sh`

---

**Quick Reference:**

Clean all ports:
```bash
# PowerShell
.\kill-ports.ps1

# Git Bash
./kill-ports.sh
```

Check specific port:
```bash
netstat -ano | findstr :3001
```

Kill specific process:
```bash
taskkill /PID <number> /F      # PowerShell
taskkill //PID <number> //F    # Git Bash
```
