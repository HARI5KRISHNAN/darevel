# Keycloak Auto-Configuration Guide

Complete guide to the automatic Keycloak authentication setup for Darevel Suite.

## Overview

Keycloak is automatically configured when you run `npm run dev`:
- **pilot180** realm is created
- All 6 Darevel app clients are registered
- 2 test users are created (demo & admin)
- Everything works out of the box!

## What Gets Auto-Configured

### Realm: pilot180

The Darevel authentication realm with:
- Login with email enabled
- User registration enabled
- Password reset enabled
- Brute force protection enabled

### Clients (6 Applications)

All Darevel apps are pre-configured:

| Client ID | App | Port | Redirect URI |
|-----------|-----|------|--------------|
| `darevel-suite` | Suite | 3000 | http://localhost:3000/* |
| `darevel-slides` | Slides | 3001 | http://localhost:3001/* |
| `darevel-chat` | Chat | 3002 | http://localhost:3002/* |
| `ai-email-assistant` | Mail | 3003 | http://localhost:3003/* |
| `darevel-excel` | Excel | 3004 | http://localhost:3004/* |
| `darevel-drive` | Drive | 3006 | http://localhost:3006/* |

### Pre-Created Users

Two test users are automatically created:

#### Demo User
- **Email:** demo@darevel.com
- **Password:** demo123
- **Roles:** user
- **Use for:** Testing regular user features

#### Admin User
- **Email:** admin@darevel.com
- **Password:** admin123
- **Roles:** user, admin
- **Use for:** Testing admin features

## How It Works

### 1. Realm Configuration File

[keycloak/realm-export.json](keycloak/realm-export.json) contains the complete realm configuration:

```json
{
  "realm": "pilot180",
  "enabled": true,
  "clients": [...],
  "users": [...]
}
```

### 2. Docker Volume Mount

In [docker-compose.yml](docker-compose.yml):

```yaml
keycloak:
  command:
    - start-dev
    - --import-realm
  volumes:
    - ./keycloak:/opt/keycloak/data/import
```

The `--import-realm` flag tells Keycloak to automatically import all JSON files from `/opt/keycloak/data/import`.

### 3. Auto-Import on Startup

When you run `npm run dev`:
1. Docker starts Keycloak
2. Keycloak finds `realm-export.json`
3. Imports the pilot180 realm
4. Creates all clients and users
5. Ready to use!

## Testing Authentication

### Test Mail App Login

1. **Start the suite:**
   ```bash
   npm run dev
   ```

2. **Open Mail app:**
   http://localhost:3003

3. **Login:**
   - Email: demo@darevel.com
   - Password: demo123

4. **Success!**
   You should be redirected back to the Mail app dashboard

### Test Other Apps

All apps are configured identically:

```bash
# Suite
http://localhost:3000

# Slides
http://localhost:3001

# Chat
http://localhost:3002

# Excel
http://localhost:3004

# Drive
http://localhost:3006
```

Use the same credentials:
- demo@darevel.com / demo123
- admin@darevel.com / admin123

## Keycloak Admin Console

### Access

**URL:** http://localhost:8080

**Credentials:**
- Username: admin
- Password: admin

### What You'll See

**Realms:**
- master (Keycloak system realm)
- **pilot180** (Darevel apps realm) ← Your apps use this

**In pilot180 realm:**
- 6 clients configured
- 2 users created
- Roles: user, admin

### Common Tasks

#### View Users

1. Login to Keycloak admin
2. Select **pilot180** realm (dropdown top-left)
3. Click **Users** in left menu
4. See demo@darevel.com and admin@darevel.com

#### View Clients

1. Select **pilot180** realm
2. Click **Clients** in left menu
3. See all 6 Darevel app clients

#### Add New User

1. Select **pilot180** realm
2. Click **Users** → **Add user**
3. Fill in details:
   - Username: user@example.com
   - Email: user@example.com
   - First name: User
   - Last name: Example
4. Click **Create**
5. Go to **Credentials** tab
6. Click **Set password**
7. Enter password, uncheck "Temporary"
8. Click **Save**

#### Change User Password

1. Select **pilot180** realm
2. Click **Users**
3. Find and click user
4. Go to **Credentials** tab
5. Click **Reset password**
6. Enter new password
7. Uncheck "Temporary" if permanent
8. Click **Save**

## Integrating Apps with Keycloak

### Configuration Per App

Each app needs these environment variables:

```env
# Keycloak URL
KEYCLOAK_URL=http://localhost:8080

# Keycloak Realm
KEYCLOAK_REALM=pilot180

# Client ID (specific to each app)
KEYCLOAK_CLIENT_ID=darevel-suite    # for Suite app
KEYCLOAK_CLIENT_ID=ai-email-assistant  # for Mail app
KEYCLOAK_CLIENT_ID=darevel-chat     # for Chat app
# etc...
```

### Example: Mail App Integration

**Install Keycloak adapter:**
```bash
cd apps/mail
npm install keycloak-js
```

**Create Keycloak instance:**
```typescript
// src/keycloak.ts
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'pilot180',
  clientId: 'ai-email-assistant'
});

export default keycloak;
```

**Initialize in app:**
```typescript
// src/main.tsx
import keycloak from './keycloak';

keycloak.init({
  onLoad: 'login-required',
  checkLoginIframe: false
}).then(authenticated => {
  if (authenticated) {
    // Render your app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <App />
    );
  }
});
```

**Get user info:**
```typescript
// In your components
const username = keycloak.tokenParsed?.preferred_username;
const email = keycloak.tokenParsed?.email;
const roles = keycloak.tokenParsed?.realm_access?.roles || [];
```

**Logout:**
```typescript
keycloak.logout({
  redirectUri: 'http://localhost:3003'
});
```

## Customizing the Realm

### Edit Realm Configuration

1. **Edit the file:**
   ```bash
   code keycloak/realm-export.json
   ```

2. **Make changes:**
   - Add more users
   - Add more clients
   - Change settings

3. **Restart to apply:**
   ```bash
   npm run clean  # Destroys existing realm
   npm run dev    # Imports updated realm
   ```

⚠️ **Warning:** `npm run clean` deletes all Keycloak data!

### Add a New Client

Add to `clients` array in `realm-export.json`:

```json
{
  "clientId": "my-new-app",
  "name": "My New App",
  "rootUrl": "http://localhost:3008",
  "redirectUris": ["http://localhost:3008/*"],
  "webOrigins": ["http://localhost:3008", "+"],
  "publicClient": true,
  "protocol": "openid-connect",
  "standardFlowEnabled": true,
  "directAccessGrantsEnabled": true
}
```

### Add a New User

Add to `users` array in `realm-export.json`:

```json
{
  "username": "newuser@darevel.com",
  "enabled": true,
  "emailVerified": true,
  "firstName": "New",
  "lastName": "User",
  "email": "newuser@darevel.com",
  "realmRoles": ["user"],
  "credentials": [
    {
      "type": "password",
      "value": "password123",
      "temporary": false
    }
  ]
}
```

### Add Custom Roles

Add to `roles.realm` array:

```json
{
  "name": "premium",
  "description": "Premium subscriber role"
}
```

Then assign to users:

```json
{
  "username": "premium@darevel.com",
  "realmRoles": ["user", "premium"],
  ...
}
```

## Production Considerations

### Security

**⚠️ Current setup is for DEVELOPMENT ONLY!**

For production:

1. **Change admin password:**
   ```env
   KEYCLOAK_ADMIN=secure_admin_name
   KEYCLOAK_ADMIN_PASSWORD=VeryStrongPassword123!
   ```

2. **Use HTTPS:**
   ```json
   {
     "rootUrl": "https://mail.darevel.com",
     "redirectUris": ["https://mail.darevel.com/*"]
   }
   ```

3. **Remove test users:**
   Delete demo@darevel.com and admin@darevel.com from realm export

4. **Enable email verification:**
   ```json
   {
     "verifyEmail": true,
     "smtpServer": {
       "from": "noreply@darevel.com",
       "host": "smtp.darevel.com",
       ...
     }
   }
   ```

5. **Use production mode:**
   ```yaml
   command:
     - start
     - --optimized
     - --hostname=auth.darevel.com
   ```

### Backup Realm

**Export current realm:**
```bash
docker exec darevel_keycloak \
  /opt/keycloak/bin/kc.sh export \
  --dir /tmp/export \
  --realm pilot180

docker cp darevel_keycloak:/tmp/export/pilot180-realm.json ./backup/
```

**Restore from backup:**
```bash
cp backup/pilot180-realm.json keycloak/realm-export.json
npm run clean
npm run dev
```

## Troubleshooting

### Realm not importing

**Check Docker logs:**
```bash
npm run logs:keycloak
```

**Look for:**
```
Import: realm 'pilot180' from file /opt/keycloak/data/import/realm-export.json
```

**If missing:**
- Check file exists: `ls keycloak/realm-export.json`
- Check valid JSON: `cat keycloak/realm-export.json | jq`
- Check volume mount in docker-compose.yml

### Users can't login

**Check user exists:**
1. Go to http://localhost:8080
2. Login with admin/admin
3. Select pilot180 realm
4. Click Users
5. Search for user email

**Reset password:**
1. Click user
2. Go to Credentials tab
3. Click Reset password
4. Enter new password
5. Uncheck "Temporary"

### Redirect URI mismatch

**Error message:**
```
Invalid redirect URI
```

**Solution:**
1. Check client configuration in Keycloak admin
2. Ensure redirect URI matches exactly:
   - `http://localhost:3003/*` (with /*)
3. Update realm-export.json if needed
4. Restart: `npm run clean && npm run dev`

### Realm already exists

If you see:
```
Realm 'pilot180' already exists
```

**Option 1 - Keep existing:**
Do nothing, Keycloak keeps the existing realm

**Option 2 - Replace:**
```bash
npm run clean  # Destroys ALL data
npm run dev    # Fresh import
```

## Advanced Features

### Social Login

Add Google login to realm-export.json:

```json
{
  "identityProviders": [
    {
      "alias": "google",
      "providerId": "google",
      "enabled": true,
      "config": {
        "clientId": "your-google-client-id",
        "clientSecret": "your-google-client-secret"
      }
    }
  ]
}
```

### Multi-Factor Authentication

Enable in realm-export.json:

```json
{
  "otpPolicyType": "totp",
  "otpPolicyAlgorithm": "HmacSHA1",
  "otpPolicyDigits": 6,
  "otpPolicyPeriod": 30
}
```

### Custom Themes

1. Create theme folder:
   ```bash
   mkdir -p keycloak/themes/darevel
   ```

2. Mount in docker-compose.yml:
   ```yaml
   volumes:
     - ./keycloak/themes:/opt/keycloak/themes
   ```

3. Set in realm-export.json:
   ```json
   {
     "loginTheme": "darevel",
     "accountTheme": "darevel"
   }
   ```

## Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter)
- [Realm Import/Export](https://www.keycloak.org/docs/latest/server_admin/index.html#_export_import)
- [OpenID Connect](https://openid.net/connect/)

---

**Quick Reference:**

```bash
# Access Keycloak admin
http://localhost:8080
Username: admin
Password: admin

# Test users
demo@darevel.com / demo123
admin@darevel.com / admin123

# Reset realm
npm run clean && npm run dev

# View logs
npm run logs:keycloak
```
