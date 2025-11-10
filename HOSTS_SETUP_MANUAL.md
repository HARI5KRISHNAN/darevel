# Manual Hosts File Configuration - Darevel Suite

Complete guide for manually configuring your hosts file to enable *.darevel.local domain resolution.

## Why Do You Need This?

The Darevel Suite uses custom `.local` domains like `suite.darevel.local`, `auth.darevel.local`, etc. These are not public DNS names, so your system needs to know they point to your local machine (`127.0.0.1`).

## Quick Setup (Choose Your Method)

### Option 1: Automated Script (Recommended)

**Windows:**
```powershell
# Right-click PowerShell → Run as Administrator
cd C:\Users\acer\Downloads\darevel-suite
.\setup-hosts.ps1
```

**Linux/macOS:**
```bash
cd /path/to/darevel-suite
chmod +x setup-hosts.sh
sudo ./setup-hosts.sh
```

### Option 2: Manual Configuration (Step-by-Step Below)

Follow the instructions for your operating system.

---

## Windows - Manual Instructions

### Step 1: Open Notepad as Administrator

1. Press `Windows Key`
2. Type: `notepad`
3. **Right-click** on Notepad
4. Select **"Run as administrator"**
5. Click **Yes** on the UAC prompt

### Step 2: Open Hosts File

1. In Notepad, click **File** → **Open**
2. Navigate to: `C:\Windows\System32\drivers\etc\`
3. Change file filter from "Text Documents (*.txt)" to **"All Files (*.*)"**
4. Select **`hosts`** file
5. Click **Open**

### Step 3: Backup Current File

1. Click **File** → **Save As**
2. Save as: `hosts.backup.2025-11-10` (use today's date)
3. Click **Save**

### Step 4: Add Darevel Domains

Scroll to the bottom of the file and add these lines:

```
# Darevel Suite - Local Development
# Added on 2025-11-10
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
```

### Step 5: Save and Flush DNS

1. Click **File** → **Save**
2. Close Notepad
3. Open **Command Prompt** (can be normal, not admin)
4. Run:
   ```cmd
   ipconfig /flushdns
   ```

### Step 6: Test DNS Resolution

In Command Prompt:
```cmd
ping suite.darevel.local
ping auth.darevel.local
```

You should see replies from `127.0.0.1`.

---

## macOS - Manual Instructions

### Step 1: Open Terminal

1. Press `Cmd + Space`
2. Type: `terminal`
3. Press Enter

### Step 2: Backup Hosts File

```bash
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d)
```

Enter your password when prompted.

### Step 3: Edit Hosts File

```bash
sudo nano /etc/hosts
```

### Step 4: Add Darevel Domains

Scroll to the bottom and add:

```
# Darevel Suite - Local Development
# Added on 2025-11-10
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
```

### Step 5: Save and Exit

1. Press `Ctrl + O` (save)
2. Press `Enter` (confirm filename)
3. Press `Ctrl + X` (exit)

### Step 6: Flush DNS Cache

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Step 7: Test DNS Resolution

```bash
ping -c 1 suite.darevel.local
ping -c 1 auth.darevel.local
```

You should see replies from `127.0.0.1`.

---

## Linux (Ubuntu/Debian) - Manual Instructions

### Step 1: Open Terminal

Press `Ctrl + Alt + T`

### Step 2: Backup Hosts File

```bash
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d)
```

### Step 3: Edit Hosts File

```bash
sudo nano /etc/hosts
```

Or if you prefer vim:
```bash
sudo vim /etc/hosts
```

### Step 4: Add Darevel Domains

Scroll to the bottom and add:

```
# Darevel Suite - Local Development
# Added on 2025-11-10
127.0.0.1 suite.darevel.local
127.0.0.1 auth.darevel.local
127.0.0.1 mail.darevel.local
127.0.0.1 chat.darevel.local
127.0.0.1 excel.darevel.local
127.0.0.1 slides.darevel.local
127.0.0.1 drive.darevel.local
127.0.0.1 notify.darevel.local
```

### Step 5: Save and Exit

**For nano:**
1. Press `Ctrl + O` (save)
2. Press `Enter` (confirm)
3. Press `Ctrl + X` (exit)

**For vim:**
1. Press `Esc`
2. Type: `:wq`
3. Press `Enter`

### Step 6: Flush DNS Cache

```bash
# For systemd-resolved (Ubuntu 18.04+)
sudo systemd-resolve --flush-caches

# For nscd
sudo /etc/init.d/nscd restart

# For dnsmasq
sudo /etc/init.d/dnsmasq restart
```

### Step 7: Test DNS Resolution

```bash
ping -c 1 suite.darevel.local
ping -c 1 auth.darevel.local
```

You should see replies from `127.0.0.1`.

---

## Verification Checklist

After completing the setup, verify everything works:

### 1. DNS Resolution Test

**Windows:**
```cmd
nslookup suite.darevel.local
```

**macOS/Linux:**
```bash
dig suite.darevel.local
# or
host suite.darevel.local
```

Expected result: Points to `127.0.0.1`

### 2. Start Development Server

```bash
cd C:\Users\acer\Downloads\darevel-suite
npm run dev
```

Wait for all apps to start:
```
✓ Ready on http://localhost:3000 (Suite)
✓ Ready on http://localhost:3001 (Slides)
✓ Ready on http://localhost:3002 (Chat)
✓ Ready on http://localhost:3003 (Mail)
✓ Ready on http://localhost:3004 (Excel)
✓ Ready on http://localhost:3005 (Auth)
✓ Ready on http://localhost:3006 (Drive)
✓ Ready on http://localhost:3007 (Notify)
```

### 3. Test Suite App

1. Open browser
2. Visit: **http://suite.darevel.local:3000**
3. Expected: Redirect to **http://auth.darevel.local:3005/signin**
4. See the custom Darevel branded login page

### 4. Test SSO Login

1. Click "Sign in with Keycloak"
2. Enter credentials:
   - Email: `demo@darevel.com`
   - Password: `demo123`
3. Expected: Redirected back to Suite dashboard
4. You should be logged in!

### 5. Test SSO Across Apps

Visit each app without re-login:

- **Suite:** http://suite.darevel.local:3000
- **Slides:** http://slides.darevel.local:3001
- **Chat:** http://chat.darevel.local:3002
- **Mail:** http://mail.darevel.local:3003
- **Excel:** http://excel.darevel.local:3004
- **Auth:** http://auth.darevel.local:3005
- **Drive:** http://drive.darevel.local:3006
- **Notify:** http://notify.darevel.local:3007

**Expected:** All apps load instantly without asking for login again.

---

## Troubleshooting

### Problem 1: "This site can't be reached"

**Symptoms:**
- Browser shows DNS error
- Can't connect to suite.darevel.local

**Solutions:**

1. **Verify hosts file changes:**
   - Open hosts file again
   - Ensure Darevel entries are present
   - No typos in domain names

2. **Flush DNS again:**
   - Windows: `ipconfig /flushdns`
   - macOS: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`
   - Linux: `sudo systemd-resolve --flush-caches`

3. **Restart browser:**
   - Close all browser windows
   - Clear browser cache
   - Open new browser window

4. **Check dev server is running:**
   ```bash
   npm run dev
   ```

### Problem 2: Redirects to localhost instead of darevel.local

**Symptoms:**
- Logged in but redirected to `localhost:3000` instead of `suite.darevel.local:3000`

**Solutions:**

1. **Check .env.local files:**

   Verify each app uses subdomain URLs:

   ```env
   # apps/suite/.env.local
   NEXTAUTH_URL=http://suite.darevel.local:3000

   # apps/auth/.env.local
   NEXTAUTH_URL=http://auth.darevel.local:3005
   ```

2. **Restart development server:**
   ```bash
   # Kill current server (Ctrl+C)
   npm run dev
   ```

### Problem 3: Login page shows but login fails

**Symptoms:**
- Custom login page loads
- Click "Sign in with Keycloak" → Error

**Solutions:**

1. **Check Keycloak is running:**
   ```bash
   docker ps | grep keycloak
   ```

2. **Verify Keycloak redirect URIs:**
   - Login to Keycloak admin: http://localhost:8080
   - Check client settings include wildcard URIs

3. **Check Redis is running:**
   ```bash
   docker ps | grep redis
   ```

4. **Verify environment variables:**
   ```bash
   # In apps/auth/.env.local
   KEYCLOAK_ISSUER=http://localhost:8080/realms/pilot180
   KEYCLOAK_CLIENT_ID=darevel-auth
   NEXTAUTH_SECRET=darevel-sso-secret-change-in-production
   ```

### Problem 4: Hosts file won't save (Permission Denied)

**Windows:**
- Must run Notepad as Administrator
- Right-click → "Run as administrator"

**macOS/Linux:**
- Must use `sudo` command
- `sudo nano /etc/hosts`

### Problem 5: Still getting withAuth error

**Symptoms:**
- Error: `Export 'withAuth' was not found in 'next-auth/middleware'`

**Solutions:**

1. **Delete .next folders:**
   ```bash
   rm -rf apps/*/.next
   ```

2. **Clear node_modules cache:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## How to Undo Changes

If you need to remove the Darevel domains:

### Windows

1. Open Notepad as Administrator
2. Open: `C:\Windows\System32\drivers\etc\hosts`
3. Delete lines starting with `# Darevel Suite` through the last Darevel domain
4. Save
5. Run: `ipconfig /flushdns`

### macOS/Linux

```bash
sudo nano /etc/hosts
```

Remove Darevel section, save, then flush DNS.

Or restore from backup:
```bash
sudo cp /etc/hosts.backup.20251110 /etc/hosts
sudo dscacheutil -flushcache  # macOS
sudo systemd-resolve --flush-caches  # Linux
```

---

## Security Notes

### Localhost-Only Access

These hosts file entries **only affect your local machine**:

- ✅ Only you can access these domains
- ✅ Traffic never leaves your computer
- ✅ Safe for development
- ❌ Not accessible from other devices on your network

### Production Considerations

When deploying to production:

1. **Remove .local domains:**
   - Use real public domains (e.g., suite.darevel.com)
   - Configure proper DNS records

2. **Update environment variables:**
   - Change NEXTAUTH_URL to production URLs
   - Use production Keycloak instance
   - Update all redirect URIs

3. **Enable HTTPS:**
   - Get SSL certificates
   - Use __Secure-next-auth.session-token cookie

---

## Next Steps After Setup

Once DNS is working and you can access all apps:

1. **Explore the Suite:**
   - Test navigation between apps
   - Verify SSO works seamlessly
   - Check all features load correctly

2. **Development Workflow:**
   - All apps run in parallel: `npm run dev`
   - Make changes to any app
   - Hot reload works automatically

3. **Keycloak Configuration:**
   - Add more users
   - Configure roles and permissions
   - Customize realm settings

4. **Customize Branding:**
   - Update logo in apps/auth/public/logo.jpg
   - Modify colors in signin page
   - Adjust animations

---

## Quick Reference

### Hosts File Locations

| OS | Path |
|----|------|
| Windows | `C:\Windows\System32\drivers\etc\hosts` |
| macOS | `/etc/hosts` |
| Linux | `/etc/hosts` |

### DNS Flush Commands

| OS | Command |
|----|---------|
| Windows | `ipconfig /flushdns` |
| macOS | `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` |
| Linux (systemd) | `sudo systemd-resolve --flush-caches` |
| Linux (nscd) | `sudo /etc/init.d/nscd restart` |

### Darevel Domains

All map to `127.0.0.1`:

```
suite.darevel.local:3000   - Suite Dashboard
auth.darevel.local:3005    - Central Authentication
mail.darevel.local:3003    - AI Email Assistant
chat.darevel.local:3002    - AI Chat
excel.darevel.local:3004   - Spreadsheets
slides.darevel.local:3001  - Presentations
drive.darevel.local:3006   - File Storage
notify.darevel.local:3007  - Notifications
```

### Demo Credentials

```
Email: demo@darevel.com
Password: demo123
```

---

**Status:** ✅ **Complete Guide**

**Last Updated:** 2025-11-10

**Your Darevel Suite is ready for Google Workspace-style SSO development!**
