# Darevel Suite - Quick Start Guide

## ✅ Prerequisites Complete

- ✅ DNS entries added to `/etc/hosts`
- ✅ Keycloak SSO configured
- ✅ All apps configured with environment variables
- ✅ Nginx reverse proxy configured

---

## 🚀 Start Everything (One Command)

```bash
cd /home/user/darevel
./start-all.sh
```

This script will:
1. Start Docker services (Keycloak, PostgreSQL, Redis, Nginx)
2. Wait for Keycloak to be ready
3. Start all 8 frontend applications
4. Show you the URLs and credentials

**Wait 1-2 minutes** for everything to start, then proceed to testing.

---

## 🧪 Test SSO (Single Sign-On)

1. **Open your browser** to: http://darevel.local

2. **You'll be redirected** to the login page

3. **Login with test credentials:**
   - Email: `demo@darevel.com`
   - Password: `demo123`

4. **After login**, you'll see the Suite dashboard

5. **Test SSO** - Open new tabs and visit:
   - http://chat.darevel.local ← Should be **automatically logged in** ✅
   - http://mail.darevel.local ← Should be **automatically logged in** ✅
   - http://drive.darevel.local ← Should be **automatically logged in** ✅
   - http://excel.darevel.local ← Should be **automatically logged in** ✅
   - http://slides.darevel.local ← Should be **automatically logged in** ✅
   - http://notify.darevel.local ← Should be **automatically logged in** ✅

6. **Verify session cookie:**
   - Open DevTools (F12) → Application → Cookies
   - Look for `.darevel.local` domain
   - You should see: `darevel-session` cookie ✅

7. **Test logout:**
   - Logout from any app
   - Try accessing another app
   - You should be redirected to login ✅

---

## 🛑 Stop Everything

```bash
cd /home/user/darevel
./stop-all.sh
```

This will stop:
- All Docker services
- All frontend applications

---

## 📊 View Logs

### Application Logs
```bash
# View specific app log
tail -f logs/suite.log
tail -f logs/auth.log
tail -f logs/chat.log

# View all logs
ls -lh logs/
```

### Docker Logs
```bash
# Keycloak logs
docker logs -f darevel_keycloak

# Nginx logs
docker logs -f darevel_nginx

# All services
docker-compose logs -f
```

---

## 🔍 Check Service Status

### Docker Services
```bash
docker-compose ps
```

### Frontend Apps (via Nginx)
```bash
curl -I http://darevel.local
curl -I http://auth.darevel.local
curl -I http://chat.darevel.local
```

### Frontend Apps (Direct)
```bash
curl -I http://localhost:3002  # Suite
curl -I http://localhost:3005  # Auth
curl -I http://localhost:3003  # Chat
```

### Keycloak
```bash
curl http://localhost:8080/realms/pilot180/.well-known/openid-configuration
```

---

## 🐛 Troubleshooting

### Problem: Apps won't start

**Check if ports are in use:**
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3002
# ... etc
```

**Kill processes using those ports:**
```bash
pkill -f "npm run dev"
```

### Problem: Keycloak not starting

**Check Keycloak logs:**
```bash
docker logs darevel_keycloak
```

**Restart Keycloak:**
```bash
docker-compose restart keycloak
```

**Wait longer** - Keycloak can take 1-2 minutes to start.

### Problem: "Cannot reach darevel.local"

**Verify DNS entries:**
```bash
getent hosts darevel.local
# Should show: 127.0.0.1       darevel.local
```

**Re-add DNS entries if needed:**
```bash
./setup-dns.sh
```

### Problem: Session not shared between apps

**Verify you're using domain URLs** (not localhost:PORT):
- ✅ Use: http://darevel.local
- ❌ Don't use: http://localhost:3002

**Clear browser cookies:**
1. Open DevTools (F12)
2. Application → Cookies
3. Delete all cookies for `.darevel.local`
4. Try logging in again

### Problem: CORS errors in console

**Restart backend services:**
```bash
docker-compose restart backend api-gateway
```

**Check API Gateway logs:**
```bash
docker logs darevel_api_gateway
```

---

## 🔑 Admin Access

### Keycloak Admin Console
- **URL:** http://localhost:8080
- **Username:** `admin`
- **Password:** `admin`

### Admin User in Apps
- **Email:** `admin@darevel.com`
- **Password:** `admin123`

---

## 📱 Available Applications

| App | Domain | Port | Status |
|-----|--------|------|--------|
| **Suite** | http://darevel.local | 3002 | Main Entry Point |
| **Auth** | http://auth.darevel.local | 3005 | Auth Gateway |
| **Chat** | http://chat.darevel.local | 3003 | ⚠️ Needs NextAuth |
| **Mail** | http://mail.darevel.local | 3004 | ⚠️ Needs NextAuth |
| **Drive** | http://drive.darevel.local | 3006 | ✅ Configured |
| **Excel** | http://excel.darevel.local | 3001 | ⚠️ Needs NextAuth |
| **Slides** | http://slides.darevel.local | 3000 | ✅ Configured |
| **Notify** | http://notify.darevel.local | 3007 | ✅ Configured |

⚠️ Apps marked "Needs NextAuth" have `.env.local` configured but need `next-auth` package installed and auth configuration added. See `NEXTAUTH_INTEGRATION_GUIDE.md` for instructions.

---

## 📚 Additional Documentation

- **Complete Architecture:** `KEYCLOAK_SSO_INTEGRATION.md`
- **NextAuth Integration:** `NEXTAUTH_INTEGRATION_GUIDE.md`
- **Detailed Testing:** `SSO_SETUP_AND_TESTING_GUIDE.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Success Checklist

- [ ] All Docker services running (`docker-compose ps`)
- [ ] All frontend apps running (check logs/)
- [ ] Can access http://darevel.local
- [ ] Can login with demo@darevel.com
- [ ] Session shared across apps (test multiple domains)
- [ ] Logout works from all apps
- [ ] No CORS errors in browser console
- [ ] Session cookie visible in DevTools
- [ ] Can access Keycloak admin console

---

## 💡 Tips

1. **Always use domain URLs** when testing SSO (not localhost:PORT)
2. **Wait for Keycloak** to fully start before accessing apps
3. **Check logs** if something doesn't work (`logs/<app>.log`)
4. **Clear browser cookies** if session issues occur
5. **Use Chrome DevTools** to inspect the session cookie

---

## 🎉 You're All Set!

Run `./start-all.sh` and start testing your Keycloak SSO integration!

**Questions?** See the comprehensive guides in the documentation files.

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
**Branch:** `claude/keycloak-auth-integration-011CUzUyrQUjguQwG53MHe8U`
